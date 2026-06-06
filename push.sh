#!/bin/bash

# Define color codes
green="\e[32m"
yellow="\e[33m"
red="\e[31m"
reset="\e[0m"

# Banner
echo -e "${green}"
echo "╔════════════════════════════════════════════════════╗"
echo "║         Migrating your work to Cloud              ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${reset}"

# Ask for commit message
echo -ne "${yellow}Enter commit message (leave blank for default): ${reset}"
read -r commit_message

# Use default message if empty
if [ -z "$commit_message" ]; then
    commit_message="Automated backup $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Add changes
git add .

# Show status
git status

# Commit changes
git commit -m "$commit_message"

# Check if commit succeeded
if [ $? -ne 0 ]; then
    echo -e "${red}Git commit failed. Aborting push.${reset}"
    exit 1
fi

# Push changes
git push

# Completion message
echo -e "${green}"
echo "╔════════════════════════════════════════════════════╗"
echo "║      Your work has been saved remotely            ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${reset}"