#!/bin/bash

green="\e[32m"
yellow="\e[33m"
red="\e[31m"
reset="\e[0m"

echo -e "${green}"
echo "╔════════════════════════════════════════════════════╗"
echo "║         Migrating your work to github              ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${reset}"

# Commit message

echo -ne "${yellow}Enter commit message: ${reset}"
read -r commit_message

if [ -z "$commit_message" ]; then
commit_message="Automated backup $(date '+%Y-%m-%d %H:%M:%S')"
fi

git add .
git status

git commit -m "$commit_message"

if [ $? -ne 0 ]; then
echo -e "${red}Commit failed. Exiting.${reset}"
exit 1
fi

current_branch=$(git branch --show-current)

echo
echo "Select an action:"
echo "1) Push directly"
echo "2) Create Pull Request"
echo "3) Exit"
echo

read -rp "Choice [1-3]: " choice

case $choice in
1)
echo -e "${yellow}Pushing changes...${reset}"
git push
;;
2)
echo -e "${yellow}Creating Pull Request...${reset}"

```
    git push -u origin "$current_branch"

    gh pr create \
        --fill \
        --title "$commit_message"

    ;;
3)
    echo "Exiting..."
    exit 0
    ;;
*)
    echo -e "${red}Invalid option.${reset}"
    exit 1
    ;;
```

esac

echo -e "${green}"
echo "╔════════════════════════════════════════════════════╗"
echo "║          Operation Completed Successfully         ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${reset}"
