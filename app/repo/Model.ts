import $ = require('jquery');
import jqXHR = JQuery.jqXHR;
import {Success} from "../domain/rest/Success";
import {METHOD_HTTP} from "../util/Constants";

export class Model {

    public static callServer(url: string, method: string, async: boolean = true, data: Object = {}): jqXHR<Success> {
        return $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            async: async,
            data: method == METHOD_HTTP.get ? '' : JSON.stringify(data)
        });
    }
}
