import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { AutoCompleteNameResult } from '../../../autocomplete/AutoCompleteNameResult.js';
import { extension_settings } from '../../../extensions.js';
import { isTrueBoolean } from '../../../utils.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';

import { InputHistoryAutoComplete } from './src/InputHistoryAutoComplete.js';
import { InputHistoryAutoCompleteOption } from './src/InputHistoryAutoCompleteOption.js';

class Settings {
    /**@type {Number}*/ maxHistory = 10;
}
/**@type {Settings}*/
const settings = Object.assign(new Settings, extension_settings.inputHistory ?? {});
extension_settings.inputHistory = settings;
/**@type {HTMLTextAreaElement} */
const ta = document.querySelector('#send_textarea');

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'inputhistory-config',
    callback: ({ key, get }, value)=>{
        if (!key) {
            toastr.error('Required argument "key" missing for /inputhistory-conf');
            return;
        }
        const keys = ['maxHistory'];
        const types = {
            maxHistory: Number,
        };
        if (!keys.includes(key)) {
            toastr.error(`Invalid "key" argument "${key}" supplied for /inputhistory-conf`);
            return;
        }
        if (isTrueBoolean(get)) {
            toastr.info(`Input History setting ${key} = ${JSON.stringify(settings[key])}`);
            return JSON.stringify(settings[key]);
        }
        settings[key] = types[key](value.trim());
        saveSettingsDebounced();
    },
    aliases: ['ih-config'],
    namedArgumentList: [
        SlashCommandNamedArgument.fromProps({ name: 'key',
            description: 'Key of the setting to change or retrieve',
            typeList: [ARGUMENT_TYPE.STRING],
            enumList: ['maxHistory'],
            isRequired: true,
        }),
        SlashCommandNamedArgument.fromProps({ name: 'get',
            description: 'Whether to retrieve the setting\'s current value without changing it.',
            typeList: [ARGUMENT_TYPE.BOOLEAN],
            isRequired: false,
            defaultValue: 'false',
            enumList: ['true', 'false'],
        }),
    ],
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({ description: 'the new config value',
            typeList: [ARGUMENT_TYPE.NUMBER],
            isRequired: false,
        }),
    ],
    helpString: 'Change Input History configuration. Use <code>get=true</code> to retrieve the current value.',
}));

SlashCommandParser.addCommandObject(SlashCommand.fromProps({ name: 'inputhistory-add',
    callback: (args, value)=>{
        if (value.trim() == '') {
            toastr.error('Required string missing for /inputhistory-add');
            return;
        }
        addToInputHistory(value);
    },
    aliases: ['ih-add'],
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({ description: 'string to add to input history',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
        }),
    ],
    helpString: 'Adds input string to Input History (typically used for Quick Reply macros).',
}));

eventSource.on(event_types.APP_READY, async()=>{
    $('#send_textarea').on('keydown', (evt) => {
        if (evt.altKey) {
            if (evt.key == 'ArrowUp') {
                evt.preventDefault();
                evt.stopPropagation();
                inputHistoryBack();
            } else if (evt.key == 'ArrowDown') {
                evt.preventDefault();
                evt.stopPropagation();
                inputHistoryForward();
            }
        }
    });

    const taClone = /**@type{HTMLTextAreaElement}*/(ta.cloneNode(true));
    taClone.classList.add('stih--clone');
    let isAc = false;
    const ac = new InputHistoryAutoComplete(
        taClone,
        ()=>isAc,
        async(text, index)=>{
            const result = new AutoCompleteNameResult(
                taClone.value,
                index,
                getInputHistory().map(it=>new InputHistoryAutoCompleteOption(it)),
            );
            result.start = 0;
            return result;
        },
    );
    ac.onHide = ()=>{
        isAc = false;
        taClone.remove();
        ta.value = taClone.value;
        ta.focus();
        ta.dispatchEvent(new Event('input', { bubbles:true }));
    };

    ta.addEventListener('keydown', async(evt)=>{
        if (!(evt.altKey && evt.key == 'h')) return;
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        taClone.value = ta.value;
        ta.value = '';
        ta.dispatchEvent(new Event('input', { bubbles:true }));
        isAc = true;
        const rect = ta.getBoundingClientRect();
        taClone.style.left = `${rect.left}px`;
        taClone.style.right = `${window.innerWidth - rect.right}px`;
        taClone.style.top = `${rect.top}px`;
        taClone.style.bottom = `${window.innerHeight - rect.bottom}px`;
        document.body.append(taClone);
        taClone.focus();
        ac.show(true, true);
    });
});
eventSource.on(event_types.GENERATION_STARTED, ()=>{
    addToInputHistory($('#send_textarea').val());
});




let inputHistoryIdx = -1;
export function getInputHistory() {
    return JSON.parse(localStorage.getItem('st--inputHistory') ?? '[]');
}
export function setInputHistory(inputHistory) {
    localStorage.setItem('st--inputHistory', JSON.stringify(inputHistory));
}
export function addToInputHistory(text) {
    text = text?.trim();
    if (text?.length) {
        const history = getInputHistory();
        if (history[0] != text) {
            history.unshift(text);
            while (history.length > settings.maxHistory) {
                history.pop();
            }
            setInputHistory(history);
        }
        inputHistoryIdx = -1;
    }
}
export function inputHistoryBack() {
    const history = getInputHistory();
    if (inputHistoryIdx + 1 < history.length) {
        inputHistoryIdx++;
    }
    ta.value = history[inputHistoryIdx];
    ta.dispatchEvent(new Event('input', { bubbles:true }));
}
export function inputHistoryForward() {
    const history = getInputHistory();
    if (inputHistoryIdx >= 0) {
        inputHistoryIdx--;
    }
    if (history.length == 0 || inputHistoryIdx < 0) {
        ta.value = '';
    } else {
        ta.value = history[inputHistoryIdx];
    }
    ta.dispatchEvent(new Event('input', { bubbles:true }));
}
