import { AutoCompleteOption } from '../../../../autocomplete/AutoCompleteOption.js';

export class InputHistoryAutoCompleteOption extends AutoCompleteOption {
    /**@type {string}*/ text;
    /**@type {number}*/ index;

    get value() {
        this.replacer = this.text;
        return this.text;
    }



    constructor(text, index) {
        super(text.replace(/[\r\n]+/g, ' '), 'H');
        this.text = text;
        this.index = index;
    }


    renderItem() {
        let li = document.createElement('li'); {
            li.classList.add('item');
            li.setAttribute('data-name', this.name);
            li.setAttribute('data-option-type', 'inputHistory');
            const type = document.createElement('span'); {
                type.classList.add('type');
                type.classList.add('monospace');
                type.textContent = this.typeIcon;
                li.append(type);
            }
            const specs = document.createElement('span'); {
                specs.classList.add('specs');
                const name = document.createElement('span'); {
                    name.classList.add('name');
                    name.classList.add('monospace');
                    this.text.split('').forEach(char=>{
                        const span = document.createElement('span'); {
                            span.textContent = char;
                            name.append(span);
                        }
                    });
                    specs.append(name);
                }
                const body = document.createElement('span'); {
                    body.classList.add('body');
                }
                li.append(specs);
            }
            const help = document.createElement('span'); {
                help.classList.add('help');
                const content = document.createElement('span'); {
                    content.classList.add('helpContent');
                    help.append(content);
                }
                li.append(help);
            }
        }
        return li;
    }
}
