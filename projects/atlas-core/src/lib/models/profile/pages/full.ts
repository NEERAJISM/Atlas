import { Page, Type } from "./page";

export class Full implements Page {
    title: string;
    type: Type;

    fullTitle: string = '';
    fullTitleColor: string = '#000000';
    fullTitleX: string = 'Mid';
    fullTitleY: string = 'Mid';
    fullTitleW: string = 'NA';
    fullTitleF: string = 'm';

    // background image is stored in /PROFILE/bizID.jpg with id as biz id
}