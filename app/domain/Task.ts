import {Person} from "./Person";

export class Task {
    id: number;
    title: string;
    description: string;
    personId: number;
    person: Person;
    image: string;


    constructor(id: number, title: string, description: string, person: Person, image: string) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.person = person;
        this.image = image;
    }
}
