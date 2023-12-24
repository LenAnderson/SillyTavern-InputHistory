import { eventSource, event_types } from '../../../../script.js';

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
            while (history.length > 10) {
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
    $('#send_textarea').val(history[inputHistoryIdx]);
}
export function inputHistoryForward() {
    const history = getInputHistory();
    if (inputHistoryIdx >= 0) {
        inputHistoryIdx--;
    }
    if (history.length == 0 || inputHistoryIdx < 0) {
        $('#send_textarea').val('');
    } else {
        $('#send_textarea').val(history[inputHistoryIdx]);
    }
}
