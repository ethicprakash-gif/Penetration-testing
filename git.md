## Git Branch Management Cheat Sheet
---

# View Branches

| Task               | Command          |
| ------------------ | ---------------- |
| Current branch     | `git branch`     |
| All local branches | `git branch`     |
| Remote branches    | `git branch -r`  |
| Local + Remote     | `git branch -a`  |
| Detailed status    | `git branch -vv` |

---

# Sync With GitHub

| Task                                   | Command                         |
| -------------------------------------- | ------------------------------- |
| Fetch updates                          | `git fetch`                     |
| Fetch + remove deleted remote branches | `git fetch --prune`             |
| Pull latest changes                    | `git pull`                      |
| Update main branch                     | `git checkout main && git pull` |

---

# Create Branches

| Task              | Command                     |
| ----------------- | --------------------------- |
| Create branch     | `git branch feature-x`      |
| Create and switch | `git checkout -b feature-x` |
| (New syntax)      | `git switch -c feature-x`   |

---

# Switch Branches

| Task          | Command                    |
| ------------- | -------------------------- |
| Switch branch | `git checkout branch-name` |
| New syntax    | `git switch branch-name`   |

---

# Push Branches

| Task                | Command                          |
| ------------------- | -------------------------------- |
| Push current branch | `git push`                       |
| Push new branch     | `git push -u origin branch-name` |
| Update remote       | `git push`                       |

---

# Delete Branches

## Local

## Local Branch Management

>  git branch | grep "feature-" | xargs git branch -D

| Task                      | Command                                              |
| ------------------------- | ---------------------------------------------------- |
| Safe delete branch        | `git branch -d <branch-name>`                        |
| Force delete branch       | `git branch -D <branch-name>`                        |
| Delete all feature branches | `git branch \| grep "^  feature-\|^\* feature-" \| xargs git branch -D` |
| List local branches       | `git branch`                                         |
| List merged branches      | `git branch --merged main`                           |



## Remote (GitHub)

| Task                 | Command                                |
| -------------------- | -------------------------------------- |
| Delete remote branch | `git push origin --delete branch-name` |

Example:

```bash
git push origin --delete feature-20260606-050823
```

---

# Find Branches Already Merged

| Task                   | Command                  |
| ---------------------- | ------------------------ |
| Show merged branches   | `git branch --merged`    |
| Show unmerged branches | `git branch --no-merged` |

Delete merged branches:

```bash
git branch --merged
git branch -d branch-name
```

---

# Clean Up Local Repo After GitHub Deletions from Web

```bash
git fetch --prune
git branch -vv
```

Look for:

```text
feature-x  abc123 [origin/feature-x: gone]
```

Then:

```bash
git branch -D feature-x
```

---

# Check Why GitHub Shows "Compare & Pull Request"

### See commits not in main

```bash
git log --oneline main..feature-branch
```

Remote:

```bash
git log --oneline main..origin/feature-branch
```

### Compare differences

```bash
git diff main..feature-branch
```

---

# Reset Local Main to Match GitHub

⚠️ Discards local commits.

```bash
git checkout main
git fetch origin
git reset --hard origin/main
```

---

# Useful Daily Workflow

### Start work

```bash
git checkout main
git pull
git checkout -b feature-test
```

### Commit changes

```bash
git add .
git commit -m "message"
git push -u origin feature-test
```

### After PR merged

```bash
git checkout main
git pull

git branch -d feature-test
git push origin --delete feature-test

git fetch --prune
```

---

# Debugging Checklist

| Question               | Command                       |
| ---------------------- | ----------------------------- |
| Where am I?            | `git branch`                  |
| What's changed?        | `git status`                  |
| What branches exist?   | `git branch -a`               |
| What is tracking what? | `git branch -vv`              |
| What's on remote?      | `git branch -r`               |
| Why PR showing?        | `git log main..origin/branch` |
| Sync with GitHub?      | `git fetch --prune`           |
.
