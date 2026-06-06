#!/bin/bash

set -e

# Colors

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

# Header

printf "${GREEN}"
echo "╔════════════════════════════════════════════════════╗"
echo "║           Migrating your work to GitHub           ║"
echo "╚════════════════════════════════════════════════════╝"
printf "${RESET}"

current_branch=$(git branch --show-current)

# Commit message

printf "${YELLOW}Enter commit message:${RESET} "
read -r commit_message

if [[ -z "$commit_message" ]]; then
commit_message="Automated backup $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo
echo "Select an action:"
echo "1) Push directly"
echo "2) Create Pull Request"
echo "3) Exit"
echo

read -rp "Choice [1-3]: " choice

case "$choice" in


1)
    git add .

    echo
    git status
    echo

    if ! git diff --cached --quiet; then
        git commit -m "$commit_message"
    else
        echo -e "${YELLOW}No changes to commit.${RESET}"
    fi

    echo -e "${YELLOW}Pushing to ${current_branch}...${RESET}"
    git push origin "$current_branch"
    ;;

2)

    echo
    echo "Branch Options:"
    echo "1) Use current branch (${current_branch})"
    echo "2) Select existing branch"
    echo "3) Create new branch"
    echo

    read -rp "Choice [1-3]: " branch_choice

    case "$branch_choice" in

        1)
            branch_name="$current_branch"
            echo -e "${GREEN}Using current branch: ${branch_name}${RESET}"
            ;;

        2)
            echo
            echo "Available branches:"
            git branch --format='%(refname:short)' | nl -w2 -s') '
            echo

            read -rp "Select branch number: " branch_num

            branch_name=$(git branch --format='%(refname:short)' | sed -n "${branch_num}p")

            if [[ -z "$branch_name" ]]; then
                echo -e "${RED}Invalid branch selection.${RESET}"
                exit 1
            fi

            git checkout "$branch_name"

            echo -e "${GREEN}Switched to ${branch_name}${RESET}"
            ;;

        3)
            read -rp "New branch name (leave blank for auto): " branch_name

            if [[ -z "$branch_name" ]]; then
                branch_name="feature-$(date +%Y%m%d-%H%M%S)"
            fi

            echo -e "${YELLOW}Creating branch ${branch_name}...${RESET}"

            git checkout -b "$branch_name"

            echo -e "${GREEN}Created ${branch_name}${RESET}"
            ;;

        *)
            echo -e "${RED}Invalid branch option.${RESET}"
            exit 1
            ;;
    esac

    git add .

    echo
    git status
    echo

    if ! git diff --cached --quiet; then
        git commit -m "$commit_message"
    else
        echo -e "${YELLOW}No changes to commit.${RESET}"
    fi

    echo -e "${YELLOW}Pushing ${branch_name} to origin...${RESET}"
    git push -u origin "$branch_name"

    echo
    echo "PR Creation Method:"
    echo "1) Enter title and description"
    echo "2) Open editor"
    echo

    read -rp "Choice [1-2]: " pr_choice

    case "$pr_choice" in

        1)
            printf "${YELLOW}Enter PR title:${RESET} "
            read -r pr_title

            [[ -z "$pr_title" ]] && pr_title="$commit_message"

            printf "${YELLOW}Enter PR description:${RESET} "
            read -r pr_body

            [[ -z "$pr_body" ]] && pr_body="$commit_message"

            gh pr create \
                --base main \
                --head "$branch_name" \
                --title "$pr_title" \
                --body "$pr_body"
            ;;

        2)
            gh pr create \
                --base main \
                --head "$branch_name" \
                --editor
            ;;

        *)
            echo -e "${RED}Invalid PR option.${RESET}"
            exit 1
            ;;
    esac
    ;;

3)
    echo "Exiting..."
    exit 0
    ;;

*)
    echo -e "${RED}Invalid option.${RESET}"
    exit 1
    ;;


esac

echo
printf "${GREEN}"
echo "╔════════════════════════════════════════════════════╗"
echo "║         Operation Completed Successfully          ║"
echo "╚════════════════════════════════════════════════════╝"
printf "${RESET}"
