#!/usr/bin/env python3
"""
Ralph Loop Demo - Shows how the autonomous loop works with live status updates.

This script demonstrates a complete Ralph loop execution that updates the status dashboard.
"""

import subprocess
import time
import sys

def run_command(cmd, description=""):
    """Run a command and return the result."""
    try:
        print(f"🔧 {description}")
        print(f"   > {cmd}")

        # Execute actual commands - this will use Python if available
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            print(f"   ✅ Success")
            if result.stdout.strip():
                print(f"   📄 Output: {result.stdout.strip()[:100]}...")
        else:
            print(f"   ❌ Failed: {result.stderr.strip()}")
            return False

        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def demo_ralph_loop():
    """Demonstrate a complete Ralph loop execution."""
    print("🚀 Ralph Loop Demo - Autonomous JWT Implementation")
    print("=" * 60)

    # Initialize the loop
    task = "Implement JWT authentication system"
    promise = "AUTH_IMPLEMENTATION_COMPLETE"
    max_iter = 5

    print(f"📋 Task: {task}")
    print(f"🎯 Completion Promise: {promise}")
    print(f"🔄 Max Iterations: {max_iter}")
    print()

    # Step 1: Initialize loop
    print("1️⃣ INITIALIZING LOOP")
    success = run_command(
        f'python3 tools/ralph_loop_manager.py init "{task}" "{promise}" {max_iter}',
        "Initialize Ralph loop state"
    )
    if not success:
        print("Failed to initialize loop")
        return

    success = run_command(
        f'python3 tools/ralph_logger.py "implement_jwt_auth" init "{task}" "{promise}" {max_iter}',
        "Initialize live status dashboard"
    )

    # Step 2: Execute iterations
    for iteration in range(1, max_iter + 1):
        print(f"\n2️⃣ ITERATION {iteration}")
        print("-" * 40)

        # Get context
        run_command(
            'python3 tools/ralph_loop_manager.py context',
            "Get current loop context"
        )

        # Simulate work for this iteration
        if iteration == 1:
            completed = "Installed jsonwebtoken library,Created User model"
            attempted = "JWT token generation"
            remaining = "Login endpoint,Password hashing,Middleware"
            verification = "Compilation successful"
            progress = "25% complete - Dependencies installed"
        elif iteration == 2:
            completed = "JWT token generation,Basic login logic"
            attempted = "Password hashing"
            remaining = "Register endpoint,Token validation"
            verification = "Login tests passing"
            progress = "50% complete - Core auth logic implemented"
        elif iteration == 3:
            completed = "Password hashing,Register endpoint"
            attempted = "Token validation middleware"
            remaining = "Complete integration tests"
            verification = "Auth endpoints working"
            progress = "75% complete - Full implementation ready"
        else:
            completed = "Token validation middleware,Integration tests"
            attempted = "Final verification"
            remaining = "None"
            verification = "All tests passing"
            progress = "100% complete - Implementation complete"

        # Update iteration notes
        run_command(
            f'python3 tools/ralph_loop_manager.py update-notes {iteration} "{completed}" "{attempted}" "{remaining}" "{verification}"',
            "Update iteration progress notes"
        )

        # Log iteration in dashboard
        run_command(
            f'python3 tools/ralph_logger.py "implement_jwt_auth" update-iteration {iteration} "{completed}" "{attempted}" "{remaining}" "{verification}"',
            "Update dashboard with iteration details"
        )

        # Update progress
        run_command(
            f'python3 tools/ralph_logger.py "implement_jwt_auth" update-progress "{progress}"',
            "Update overall progress"
        )

        # Simulate file modifications
        if iteration >= 2:
            run_command(
                'python3 tools/ralph_logger.py "implement_jwt_auth" log-file "backend/src/models/User.js"',
                "Log modified User model"
            )
            run_command(
                'python3 tools/ralph_logger.py "implement_jwt_auth" log-file "backend/src/routes/auth.js"',
                "Log modified auth routes"
            )

        # Simulate commands
        if iteration == 1:
            run_command(
                'python3 tools/ralph_logger.py "implement_jwt_auth" log-command "npm install jsonwebtoken bcryptjs" "installed successfully"',
                "Log dependency installation"
            )
        elif iteration == 2:
            run_command(
                'python3 tools/ralph_logger.py "implement_jwt_auth" log-command "npm test" "3 passing, 1 failing"',
                "Log test execution"
            )

        # Commit changes
        run_command(
            f'python3 tools/ralph_logger.py "implement_jwt_auth" log-command "git commit" "Iteration {iteration} committed"',
            "Log git commit"
        )

        # Check completion (simulate completion on iteration 4)
        if iteration >= 4:
            print(f"\n🎯 COMPLETION CHECK - Promise '{promise}' found!")
            run_command(
                'python3 tools/ralph_loop_manager.py complete',
                "Mark loop as complete"
            )
            run_command(
                'python3 tools/ralph_logger.py "implement_jwt_auth" complete true',
                "Update dashboard with completion"
            )
            print("
✅ RALPH LOOP COMPLETE!"            print(f"🎯 {promise}")
            break
        else:
            # Increment to next iteration
            run_command(
                'python3 tools/ralph_loop_manager.py increment',
                "Increment to next iteration"
            )

        # Small delay between iterations
        print("⏳ Preparing next iteration..."        time.sleep(1)

    print("
🎉 Demo Complete!"    print("📊 Open ralph_status.html in your browser to see the live execution history!"    print(f"📁 Check .ralph/ directory for loop state files")

if __name__ == "__main__":
    try:
        demo_ralph_loop()
    except KeyboardInterrupt:
        print("\n⏹️ Demo interrupted")
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        sys.exit(1)