import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { registerSlashCommand } from '../../../slash-commands.js';
import { isTrueBoolean } from '../../../utils.js';

class Settings {
    /**@type {Number}*/ maxHistory = 10;
}
/**@type {Settings}*/
const settings = Object.assign(new Settings, extension_settings.inputHistory ?? {});
extension_settings.inputHistory = settings;
/**@type {HTMLTextAreaElement} */
const ta = document.querySelector('#send_textarea');

registerSlashCommand('inputhistory-config',
    (args, value)=>{
        if (!args.key) {
            toastr.error('Required argument "key" missing for /inputHistory-conf');
            return;
        }
        const keys = ['maxHistory'];
        const types = {
            maxHistory: Number,
        };
        if (!keys.includes(args.key)) {
            toastr.error(`Invalid "key" argument "${args.key}" supplied for /inputHistory-conf`);
            return;
        }
        if (isTrueBoolean(args.get)) {
            toastr.info(`Input History setting ${args.key} = ${JSON.stringify(settings[args.key])}`);
            return JSON.stringify(settings[args.key]);
        }
        settings[args.key] = types[args.key](value.trim());
        saveSettingsDebounced();
    },
    ['ih-config'],
    '<span class="monospace">[key=maxHistory] [optional get=true] (optional new config value)</span> – Change Input History configuration. Use <code>get=true</code> to retrieve the current value.',
    true,
    true,
);

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
