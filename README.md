# Overview

**Bisq-watcher** is a highly customizable monitoring tool for the Bisq decentralized exchange.
Developed with Node.js, it's compatible across Windows, Linux, and macOS platforms.
It allows you to set up one or multiple watchers, each capable of monitoring a specific Bisq instance running on your computer. 

Each watcher is comprised of three core components:

* **File Watcher**: Monitors the `bisq.log` file.
* **Log Processor**: Parses and extracts relevant log data based on predefined rules.
* **Logger**: Sends notifications via multiple transports — currently supporting **console**, **file**, and **Telegram**.

Whether you're interested in real-time trade updates on Telegram or just keeping an eye on the logs, bisq-watcher has you covered.


Table of Contents
---

- [Overview](#overview)
- [Installation](#installation)
    - [Prerequisites](#prerequisites)
        - [Node.js](#nodejs)
        - [Yarn](#yarn)
        - [PM2](#pm2)
        - [Git Installation and Repository Cloning](#git-installation-and-repository-cloning)
- [Configuration](#configuration)
    - [App Configuration](#app-configuration)
    - [Telegram Integration](#telegram-integration)
        - [Getting API Token](#getting-api-token)
        - [Getting Chat ID](#getting-chat-id)
- [Usage](#usage)
    - [Start the Application](#start-the-application)
    - [View Output and Console](#view-output-and-console)
    - [Stop the Application](#stop-the-application)
- [Versioning and Changelog](#versioning-and-changelog)

# Installation

## Prerequisites

Before you proceed, ensure you have installed the following software:
 * Node.js
 * Yarn Package Manager
 * PM2 Process Manager

### Node.js

* Download and install Node.js from the [official website](https://nodejs.org/en).

### Corepack / Yarn

* Enable corepack (the preferred way to manage Yarn):
```shell
corepack enable
```

### PM2

* Install PM2:

```shell
yarn global add pm2
```

### Git Installation and Repository Cloning

* Before cloning the repository, make sure Git is installed on your system. If it's not, you can download and install it from the [official Git website](https://git-scm.com/).

* After installing Git, open a terminal and run the following command to clone the repository and select the latest release:

```shell
git clone https://github.com/dutu/bisq-watcher
cd bisq-watcher
git checkout v0.1.0
```

# Configuration

## App Configuration

* Rename Configuration Sample File: make a copy of the `app.config.sample.mjs` file and rename it to `app.config.mjs`.

* Edit the `app.config.mjs` file to specify the Bisq logfile location and tailor the watcher to your specific requirements.
  > This configuration file includes settings for console logging, file logging, and a Telegram bot.


### Quick Configuration Guide

Here are some common fields you might need to update:

- `logFile`: The location of the Bisq log file.
- `transports`: Array of logging transports. Available types are 'telegram', 'console', and 'file'.

For advanced configurations and all available options, please refer to the JSDoc comments within `app.config.sample.mjs`.


## Telegram Integration

For Telegram-based log notifications, you'll have to create a Telegram bot and obtain its API token and a chat ID.


### Getting API Token

* Open Telegram and search for the "BotFather" bot.

* Start a chat and use the `/newbot` command to create a new bot.

* Follow BotFather's prompts to name your bot.

* After the bot is created, you'll receive an API token. Make a note of this token as you'll need it for the `app.config.mjs` file.


### Getting Chat ID

* Add your new bot to a Telegram chat or group.

* Send a test message in the chat.

* Replace `YOUR_API_TOKEN` in the following URL and open it in a web browser:

 https://api.telegram.org/botYOUR_API_TOKEN/getUpdates

* Look for the `chat` object in the returned JSON, your chat ID will be the value of `id` within that object.


### Update `app.config.mjs`

* Add or update the Telegram bot configuration in app.config.mjs:
```js
{
  ...,
  loggerConfig: [
    ...,
    {
      type: 'telegram',
      apiToken: 'YOUR_API_TOKEN',
      chatId: 'YOUR_CHAT_ID',
      enabled: true,
      sendToTelegram: true
    }
  ]
}
```

Replace `YOUR_API_TOKEN` and `YOUR_CHAT_ID` with the actual values you obtained earlier.


# Usage

## Start the Application

* Use PM2 to start the application:

```shell
pm2 start ecosystem.config.js
```

## View Output and Console

* To view the logs:
```shell
pm2 logs
```

* To check output files, navigate to the output directory:
```
cd [output_directory]
```


## Stop the Application

* To stop the application, use:
```shell
pm2 stop bisq-watcher
```

# Versioning and Changelog

This project adheres to [Semantic Versioning](https://semver.org/). 

For the versions available and changes made in each version, see the [Releases](https://github.com/dutu/bisq-watcher/releases) on this repository.
