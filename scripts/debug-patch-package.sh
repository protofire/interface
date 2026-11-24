#!/usr/bin/env bash
# Prints environment details when patch-package fails (CodeBuild debugging).
echo "=== patch-package debug ==="
echo "node: $(node -v) | yarn: $(yarn -v) | $(git --version)"
echo "--- git config"; git config --list --show-origin 2>&1 | grep -i 'apply\|crlf\|eol\|safecrlf\|whitespace'
echo "--- HEAD: $(git rev-parse HEAD 2>&1)"
echo "--- patches"; file patches/* 2>&1; git ls-files -s patches 2>&1
echo "--- installed @uniswap versions"
for p in permit2-sdk sdk-core smart-order-router universal-router-sdk v2-sdk v3-sdk; do
  echo "$p: $(node -p "require('./node_modules/@uniswap/$p/package.json').version" 2>&1 | tail -1)"
done
echo "--- nested copies"; find node_modules -path '*/node_modules/@uniswap/sdk-core/package.json' -maxdepth 6 2>/dev/null
echo "--- verbose patch-package"; npx patch-package --error-on-fail 2>&1 | tail -40
exit 1
