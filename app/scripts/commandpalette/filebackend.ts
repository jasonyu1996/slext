import { CommandItem, CommandPaletteBackend } from "./commandpalette";
import { Service } from "typedi";
import { Slext } from "../slext";
import { File } from "../file";

function filter_prefix(file: File, filter_string: string): boolean {
    return (
        file.path.toLowerCase().startsWith(filter_string.toLowerCase()) ||
        file.name.toLowerCase().startsWith(filter_string.toLowerCase())
    );
}

function filter_subseq(file: File, filter_string: string): boolean {
    if (file.path.length < filter_string.length) return false;
    const path: string = file.path.toLowerCase();
    const filter_string_l: string = filter_string.toLowerCase();
    var p: number = 0;
    var i: number = 0;
    while (i < filter_string_l.length) {
        while (p < path.length && path.charAt(p) != filter_string_l.charAt(i)) p += 1;
        if (p >= path.length) return false;
        p += 1;
        i += 1;
    }
    return true;
}

@Service()
export class FileBackend implements CommandPaletteBackend {
    constructor(private slext: Slext) {}

    selected(item: CommandItem): void {
        const file = item.data as File;
        this.slext.selectFile(file);
    }

    getItems(filter: string): CommandItem[] {
        return this.slext
            .getFiles()
            .filter(function (file, _index) {
                return filter_subseq(file, filter);
            })
            .map(function (file): CommandItem {
                return {
                    name: file.name,
                    description: file.path,
                    type: "file",
                    data: file,
                };
            });
    }

    getPrefix(): string {
        return null;
    }
}
