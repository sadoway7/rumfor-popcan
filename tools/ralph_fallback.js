#!/usr/bin/env node
/**
 * Ralph Loop Fallback Manager - Node.js version for when Python is unavailable
 *
 * This provides basic Ralph loop state management when Python scripts can't be used.
 * Use this as a fallback in the ralph-loop mode when python3 commands fail.
 */

const fs = require('fs');
const path = require('path');

class RalphFallbackManager {
    constructor() {
        this.ralphDir = path.join(process.cwd(), '.ralph');
        this.ensureRalphDir();
        this.taskFile = null;
        this.findTaskFile();
    }

    ensureRalphDir() {
        if (!fs.existsSync(this.ralphDir)) {
            fs.mkdirSync(this.ralphDir, { recursive: true });
        }
    }

    findTaskFile() {
        const files = fs.readdirSync(this.ralphDir)
            .filter(f => f.startsWith('task_') && f.endsWith('.json'))
            .map(f => path.join(this.ralphDir, f));

        if (files.length === 0) {
            this.taskFile = null;
            return;
        }

        // Find most recent running task
        let latestRunning = null;
        let latestTime = 0;

        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                if (data.status === 'running') {
                    const time = new Date(data.start_time).getTime();
                    if (time > latestTime) {
                        latestRunning = file;
                        latestTime = time;
                    }
                }
            } catch (e) {
                // Skip invalid files
            }
        }

        this.taskFile = latestRunning || files[0];
    }

    loadState() {
        if (!this.taskFile || !fs.existsSync(this.taskFile)) {
            return null;
        }
        try {
            return JSON.parse(fs.readFileSync(this.taskFile, 'utf8'));
        } catch (e) {
            return null;
        }
    }

    saveState(state) {
        if (!this.taskFile) return;
        fs.writeFileSync(this.taskFile, JSON.stringify(state, null, 2));
    }

    init(task, completionPromise, maxIterations = 30) {
        const taskSlug = task.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').substring(0, 15);
        const taskName = `${taskSlug}_${timestamp}`;

        this.taskFile = path.join(this.ralphDir, `task_${taskName}.json`);

        const state = {
            task_name: taskName,
            task: task,
            completion_promise: completionPromise,
            max_iterations: maxIterations,
            current_iteration: 1,
            status: 'running',
            start_time: new Date().toISOString(),
            iteration_notes: {},
            overall_progress: '0% complete - Loop initialized'
        };

        this.saveState(state);
        console.log(`Initialized Ralph loop '${taskName}' for task: ${task}`);
        return state;
    }

    getContext() {
        const state = this.loadState();
        if (!state) return null;

        const currentIter = state.current_iteration;
        const previousNotes = {};

        for (let i = 1; i < currentIter; i++) {
            if (state.iteration_notes && state.iteration_notes[i]) {
                previousNotes[i] = state.iteration_notes[i];
            }
        }

        return {
            task: state.task,
            completion_promise: state.completion_promise,
            current_iteration: currentIter,
            max_iterations: state.max_iterations,
            overall_progress: state.overall_progress || '',
            previous_iteration_notes: previousNotes,
            current_iteration_notes: (state.iteration_notes && state.iteration_notes[currentIter]) || {
                completed: [],
                attempted: [],
                remaining: [],
                verification_results: []
            }
        };
    }

    updateNotes(iteration, completed = [], attempted = [], remaining = [], verification = []) {
        const state = this.loadState();
        if (!state) {
            console.log("No loop state to update");
            return;
        }

        if (!state.iteration_notes) state.iteration_notes = {};
        if (!state.iteration_notes[iteration]) {
            state.iteration_notes[iteration] = {
                completed: [],
                attempted: [],
                remaining: [],
                verification_results: []
            };
        }

        const notes = state.iteration_notes[iteration];
        if (completed.length > 0) notes.completed.push(...completed);
        if (attempted.length > 0) notes.attempted.push(...attempted);
        if (remaining.length > 0) notes.remaining = remaining; // Replace remaining
        if (verification.length > 0) notes.verification_results.push(...verification);

        this.saveState(state);
        console.log(`Updated iteration ${iteration} notes`);
    }

    increment() {
        const state = this.loadState();
        if (!state) {
            console.log("No loop state to increment");
            return false;
        }

        const current = state.current_iteration;
        const max = state.max_iterations;

        if (current >= max) {
            console.log(`Maximum iterations (${max}) reached`);
            state.status = 'error';
            state.overall_progress = `Failed - Maximum iterations (${max}) reached`;
            this.saveState(state);
            return false;
        }

        state.current_iteration = current + 1;
        this.saveState(state);
        console.log(`Incremented to iteration ${current + 1}`);
        return true;
    }

    complete(commitHash = null) {
        const state = this.loadState();
        if (!state) {
            console.log("No loop state to complete");
            return;
        }

        state.status = 'complete';
        if (commitHash) state.last_commit = commitHash;
        state.overall_progress = '100% complete - Task finished successfully';
        this.saveState(state);
        console.log("Marked loop as complete");
    }

    checkCompletion(searchContent = '') {
        const state = this.loadState();
        if (!state) return { found: false };

        const promise = state.completion_promise;
        const found = searchContent.includes(promise);

        return {
            found: found,
            promise: promise,
            searched_in: searchContent.substring(0, 100) + (searchContent.length > 100 ? '...' : '')
        };
    }
}

// CLI interface
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log("Usage: node ralph_fallback.js <command> [args...]");
        console.log("Commands:");
        console.log("  init <task> <completion_promise> [max_iterations]");
        console.log("  context");
        console.log("  update-notes <iteration> <completed> <attempted> <remaining> <verification>");
        console.log("  increment");
        console.log("  complete [commit_hash]");
        console.log("  check-completion <content>");
        return;
    }

    const manager = new RalphFallbackManager();
    const command = args[0];

    try {
        switch (command) {
            case 'init':
                if (args.length < 3) {
                    console.log("Usage: init <task> <completion_promise> [max_iterations]");
                    return;
                }
                manager.init(args[1], args[2], args[3] ? parseInt(args[3]) : 30);
                break;

            case 'context':
                const context = manager.getContext();
                console.log(JSON.stringify(context, null, 2));
                break;

            case 'update-notes':
                if (args.length < 6) {
                    console.log("Usage: update-notes <iteration> <completed> <attempted> <remaining> <verification>");
                    return;
                }
                const iteration = parseInt(args[1]);
                const completed = args[2] === 'none' ? [] : args[2].split(',');
                const attempted = args[3] === 'none' ? [] : args[3].split(',');
                const remaining = args[4] === 'none' ? [] : args[4].split(',');
                const verification = args[5] === 'none' ? [] : args[5].split(',');
                manager.updateNotes(iteration, completed, attempted, remaining, verification);
                break;

            case 'increment':
                const success = manager.increment();
                console.log(`Increment ${success ? 'successful' : 'failed'}`);
                break;

            case 'complete':
                manager.complete(args[1] || null);
                break;

            case 'check-completion':
                if (args.length < 2) {
                    console.log("Usage: check-completion <content>");
                    return;
                }
                const result = manager.checkCompletion(args[1]);
                console.log(JSON.stringify(result));
                break;

            default:
                console.log(`Unknown command: ${command}`);
        }
    } catch (error) {
        console.error(`Error executing command ${command}:`, error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = RalphFallbackManager;