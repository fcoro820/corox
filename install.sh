#!/bin/bash

# Corox CLI Installer
# Install via: curl -sSL https://raw.githubusercontent.com/yourusername/corox/main/install.sh | bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Corox CLI Installation...${NC}"

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed.${NC}"
    echo -e "Please install Node.js first from https://nodejs.org/"
    exit 1
fi

# 2. Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed.${NC}"
    echo -e "Please install npm or Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✔ Node.js and npm found.${NC}"

# 3. Attempt to install Corox CLI globally
echo -e "${BLUE}📦 Installing corox-cli globally...${NC}"

# Try to install without sudo first (for NVM users)
if npm install -g corox-cli; then
    echo -e "${GREEN}✔ Installation successful!${NC}"
else
    echo -e "${YELLOW}⚠️  Standard installation failed. Trying with sudo...${NC}"
    if sudo npm install -g corox-cli; then
        echo -e "${GREEN}✔ Installation successful with sudo!${NC}"
    else
        echo -e "${RED}❌ Installation failed. Please check your permissions or run: sudo npm install -g corox-cli${NC}"
        exit 1
    fi
fi

# 4. Verify installation
if command -v corox &> /dev/null; then
    echo -e "\n${GREEN}🎉 Corox CLI is now installed and ready to use!${NC}"
    echo -e "Run ${BLUE}'corox'${NC} to start the interactive menu."
    echo -e "Run ${BLUE}'corox --help'${NC} to see available commands.\n"
else
    echo -e "${RED}❌ Installation seemed to succeed, but the 'corox' command was not found in your PATH.${NC}"
    echo -e "You might need to restart your terminal or check your npm global bin folder."
    exit 1
fi
