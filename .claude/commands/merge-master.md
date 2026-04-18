Arguments: $ARGUMENTS (format: "ProjectName TicketNo" e.g. "LIFT 42")

Merge the current branch with master and resolve any conflicts that arise.

Steps:
1. Parse the two arguments: first is ProjectName, second is TicketNo
2. Run `git status` and `git diff` to understand what local changes exist
3. Stage all changes with `git add -A`
4. Look at the staged diff to understand what feature or fix was worked on, then write a concise commit message summarizing it
5. Commit using the format: `ProjectName(TicketNo): your-generated-message` — e.g. `LIFT(42): add workout edit page with set tracking`
6. Run `git fetch origin master` to get the latest master
7. Run `git merge origin/master` to merge
8. If there are merge conflicts, read each conflicted file, understand both sides of the conflict, and resolve them — prefer the current branch's intent but incorporate necessary changes from master
9. After resolving all conflicts, stage the resolved files and complete the merge with `git commit`
10. Note the current feature branch name, then switch to master: `git checkout master`
11. Merge the feature branch into master: `git merge <feature-branch>`
12. Push master to remote: `git push origin master`
13. Delete the feature branch locally: `git branch -d <feature-branch>`
14. Report what was committed, any conflicts resolved, and confirm the user is now on master, pushed, and the feature branch is cleaned up
