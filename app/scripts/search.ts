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
    private pdfViewer: JQuery<HTMLElement>;
    private prevScrollTop: number;

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

    private startSearchOnPage(page_list: HTMLElement[], i: number, re: RegExp): void {
        if (i >= page_list.length) {
            this.pdfViewer.scrollTop(this.prevScrollTop);
            if (this.currentIndex >= this.results.length) {
                this.currentIndex = this.results.length - 1;
            }
            if (this.currentIndex < 0) this.currentIndex = 0;
            this.goToCurrent();
        } else {
            page_list[i].scrollIntoView();
            setTimeout(() => {
                const occurrences = ($(page_list[i]).text().toString().match(re) || []).length;
                for (let j = 0; j < occurrences; j++) this.results.push(page_list[i]);
                this.startSearchOnPage(page_list, i + 1, re);
            }, 500);
        }
    }

    public update(): void {
        this.pdfViewer = $(".pdfjs-viewer");
        this.prevScrollTop = 0;
        this.prevScrollTop = this.pdfViewer.scrollTop();

        this.pdfViewer.scrollTop(this.pdfViewer[0].scrollHeight);

        setTimeout(() => {
            let re = new RegExp(this.keyword, "g");
            this.results = [];
            const page_list = $(".page-container").get();

            this.startSearchOnPage(page_list, 0, re);
        }, 500);
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
