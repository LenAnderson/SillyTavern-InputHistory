import { AutoComplete } from '../../../../autocomplete/AutoComplete.js';
import { AutoCompleteNameResult } from '../../../../autocomplete/AutoCompleteNameResult.js';
import { InputHistoryAutoCompleteOption } from './InputHistoryAutoCompleteOption.js';

export class InputHistoryAutoComplete extends AutoComplete {
    /**@type {function}*/ onHide;




    /**
     * @param {HTMLTextAreaElement} textarea The textarea to receive autocomplete.
     * @param {() => boolean} checkIfActivate Function should return true only if under the current conditions, autocomplete should display (e.g., for slash commands: autoComplete.text[0] == '/')
     * @param {(text: string, index: number) => Promise<AutoCompleteNameResult>} getNameAt Function should return (unfiltered, matching against input is done in AutoComplete) information about name options at index in text.
     */
    constructor(textarea, checkIfActivate, getNameAt) {
        super(textarea, checkIfActivate, getNameAt);
    }

    hide() {
        // return;
        super.hide();
        this.onHide?.();
    }
    async select() {
        await super.select();
        this.hide();
    }

    /**
     * @param {InputHistoryAutoCompleteOption} a
     * @param {InputHistoryAutoCompleteOption} b
     */
    fuzzyScoreCompare(a, b) {
        return a.index - b.index;
    }
}
