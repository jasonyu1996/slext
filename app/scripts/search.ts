import { Slext } from "./slext";
import * as $ from "jquery";
import { Service, Container } from "typedi";
import { Shortcut } from "shortcut.service";

export class Search {
    private static field: string = require("../templates/searchfield.html");
    private shortcut: Shortcut;
    private keyword: string;
    private currentIndex: number;
    private results: HTMLElement[];
    private active: boolean;

    field: JQuery<HTMLElement>;

    constructor(private slext: Slext) {
        this.shortcut = Container.get(Shortcut);
        this.field = $(Search.field);
        this.keyword = "";
        this.currentIndex = 0;
        this.active = false;

        $("body").append(this.field);

        $(document).on("keydown", (e) => {
            if (e.which == 27) {
                // esc
                this.closeField();
                e.preventDefault();
            }
        });

        this.field.on("keydown", ".searchfield__input", (e) => {
            if (e.which == 13) {
                // enter
                this.closeField();
                this.searchString($(e.currentTarget).val().toString());
                e.preventDefault();
            }
        });

        this.shortcut.addEventListener("Meta+F", (e) => {
            this.toggleField();
            e.preventDefault();
        });

        this.shortcut.addEventListener("Meta+N", (e) => {
            this.goToNext();
            e.preventDefault();
        });

        this.shortcut.addEventListener("Meta+B", (e) => {
            this.goToPrevious();
            e.preventDefault();
        });
    }

    public toggleField(): void {
        this.field.toggleClass("searchfield--active");
        this.active = !this.active;
        if (this.active) {
            this.field.children(".searchfield__input").focus();
            this.field.children(".searchfield__input").select();
        }
    }

    public closeField(): void {
        this.active = false;
        this.field.removeClass("searchfield--active");
    }

    public searchString(keyword: string): void {
        this.keyword = keyword;
        this.currentIndex = 0;
        this.update();
    }

    public update(): void {
        let re = new RegExp(this.keyword, "g");
        const pages = $(".page-container");
        this.results = [];
        pages.each((_index, element) => {
            const occurences = ($(element).text().toString().match(re) || []).length;
            for (let i = 0; i < occurences; i++) this.results.push(element);
        });
        if (this.currentIndex >= this.results.length) {
            this.currentIndex = this.results.length - 1;
        }
        if (this.currentIndex < 0) this.currentIndex = 0;
        this.goToCurrent();
    }

    public goToCurrent(): void {
        if (this.currentIndex >= 0 && this.currentIndex < this.results.length) {
            this.results[this.currentIndex].scrollIntoView();
        }
    }

    public goToPrevious(): void {
        if (this.currentIndex > 0) {
            this.currentIndex -= 1;
            this.results[this.currentIndex].scrollIntoView();
        }
    }

    public goToNext(): void {
        if (this.currentIndex + 1 < this.results.length) {
            this.currentIndex += 1;
            this.results[this.currentIndex].scrollIntoView();
        }
    }
}
