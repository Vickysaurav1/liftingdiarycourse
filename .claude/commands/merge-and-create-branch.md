The arguments are: $ARGUMENTS

Parse the arguments as follows:
- The first argument (required) is the new branch name to create after merging.
- Everything after the first argument is the commit message to use (optional). If a commit message is provided, use it exactly as given. If no commit message is provided, generate a suitable one based on the code changes.

commit any changes in the current branch using the commit message rules above, then merge the current branch into the master branch and resolve any issues off the back of that merge. then create a new branch using the first argument as the branch name.