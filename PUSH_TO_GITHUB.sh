#!/bin/bash

# 🚀 Script to push Loka Phase 7 to GitHub
# Usage: bash PUSH_TO_GITHUB.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 LOKA - PUSHING PHASE 7 TO GITHUB 🚀              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo

# Verify we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    echo "   Please cd to: /home/kennedy/Téléchargements/Loka-main\(1\)/Loka-main"
    exit 1
fi

# Check remote
REMOTE=$(git config --get remote.origin.url)
echo "📍 Remote: $REMOTE"
echo "📌 Branch: $(git rev-parse --abbrev-ref HEAD)"
echo

# Count pending commits
PENDING=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "2")
echo "📤 Ready to push $PENDING commits"
echo

# Show commits
echo "📝 Commits to push:"
git log --oneline -2
echo

# Attempt to push
echo "⏳ Pushing to GitHub..."
echo

# For HTTPS, git will prompt for username and password/token
# You need a Personal Access Token from GitHub
# https://github.com/settings/tokens (scope: repo, workflow)

git push -u origin main

if [ $? -eq 0 ]; then
    echo
    echo "✅ Push successful!"
    echo
    echo "🎉 Phase 7 is now on GitHub!"
    echo "   Repository: https://github.com/Kesjs/Loka"
    echo
    echo "📚 Next Steps:"
    echo "   1. Create GitHub Release for Phase 7"
    echo "   2. Setup GitHub Actions CI/CD"
    echo "   3. Configure Vercel deployment"
    echo "   4. Start Phase 8 (Documentation & Deployment)"
else
    echo
    echo "❌ Push failed. Possible issues:"
    echo "   1. No Personal Access Token configured"
    echo "   2. Token doesn't have 'repo' scope"
    echo "   3. Network connectivity issue"
    echo
    echo "📖 To fix:"
    echo "   1. Create PAT at: https://github.com/settings/tokens"
    echo "   2. Use as password when git prompts"
    echo "   3. Or configure: git config credential.helper store"
fi

echo
