module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['info'],
  description: "Beginner's guide",
  usage: "Help [page] or [command]",
  credits: 'Develeoper',
};

// Function to format text using custom font mapping
let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

module.exports.run = async function({
  api,
  event,
  enableCommands,
  args,
  Utils,
  prefix
}) {
  const input = args.join(' ');
  try {
    const eventCommands = enableCommands[1].handleEvent;
    const commands = enableCommands[0].commands;

    if (!input) {
      const pages = 50;
      let page = 1;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = formatFont(`Command List:\n\n`);
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += formatFont(`\t${i + 1}. 「 ${prefix}${commands[i]} 」\n`);
      }
      helpMessage += formatFont('\nEvent List:\n\n');
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += formatFont(`\t${index + 1}. 「 ${prefix}${eventCommand} 」\n`);
      });
      helpMessage += formatFont(`\nPage ${page}/${Math.ceil(commands.length / pages)}. To view the next page, type '${prefix}help page number'. To view information about a specific command, type '${prefix}help command name'.`);
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = formatFont(`Command List:\n\n`);
      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += formatFont(`\t${i + 1}. 「 ${prefix}${commands[i]} 」\n`);
      }
      helpMessage += formatFont('\nEvent List:\n\n');
      eventCommands.forEach((eventCommand, index) => {
        helpMessage += formatFont(`\t${index + 1}. 「 ${prefix}${eventCommand} 」\n`);
      });
      helpMessage += formatFont(`\nPage ${page} of ${Math.ceil(commands.length / pages)}`);
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else {
      const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) => key.includes(input?.toLowerCase()))?.[1];
      if (command) {
        const {
          name,
          version,
          role,
          aliases = [],
          description,
          usage,
          credits,
          cooldown,
          hasPrefix
        } = command;
        const roleMessage = role !== undefined ? (role === 0 ? '➛ Permission: user' : (role === 1 ? '➛ Permission: admin' : (role === 2 ? '➛ Permission: thread Admin' : (role === 3 ? '➛ Permission: super Admin' : '')))) : '';
        const aliasesMessage = aliases.length ? formatFont(`➛ Aliases: ${aliases.join(', ')}\n`) : '';
        const descriptionMessage = description ? formatFont(`Description: ${description}\n`) : '';
        const usageMessage = usage ? formatFont(`➛ Usage: ${usage}\n`) : '';
        const creditsMessage = credits ? formatFont(`➛ Credits: ${credits}\n`) : '';
        const versionMessage = version ? formatFont(`➛ Version: ${version}\n`) : '';
        const cooldownMessage = cooldown ? formatFont(`➛ Cooldown: ${cooldown} second(s)\n`) : '';
        const message = formatFont(` 「 Command 」\n\n➛ Name: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`);
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage(formatFont('Command not found.'), event.threadID, event.messageID);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.handleEvent = async function({
  api,
  event,
  prefix
}) {
  const {
    threadID,
    messageID,
    body
  } = event;
  const message = prefix ? formatFont('This is my prefix: ' + prefix) : formatFont("Sorry I don't have a prefix");
  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }
}