/*
 * Copyright © 2024 Ben Petrillo. All rights reserved.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * All portions of this software are available for public use,
 * provided that credit is given to the original author(s).
 */

import { Request, Response } from "express";
import { Paste } from "../database/PonjoPasteSchema";
import {Result, ValidationError, validationResult} from "express-validator";
import database from "../Server";
import ShortUniqueId from "short-unique-id";

const renderHomepage = async (_req: Request, res: Response) => {
    const pastes: Paste[] = await database.getAllPastes();
    return res.render("index", {
        data: {
            pastes: pastes.length
        }
    });
};

export const renderAllPastes = async (_req: Request, res: Response) => {
    const pastes: Paste[] = await database.getAllPastes();
    return res.status(200).render("all", {
        data: {
            pastes: pastes.reverse()
        }
    })
}

export const renderPasteById = async (req: Request, res: Response) => {
    try {
        validationResult(req);
        const { id } = req.params;
        const paste: Paste = await database.getPaste(id);
        return res.status(200)
            .render("success", {
                data: {
                    id: paste.id,
                    title: paste.title,
                    content: paste.content,
                    codeblock: paste.codeblock
                }
            });
    } catch (error: any) {
        return res.status(500).json({ error });
    }
}

export const renderPasteFormPage = async (_req: Request, res: Response) => {
    return res.status(200).render("create");
}

export const parseCreatePasteFormInput = async (req: Request, res: Response) => {
    const result: Result<ValidationError> = validationResult(req);
    try {
        const { title, content, codeblock } = req.body;
        const data: Paste = await database.createPaste(
            {
                id: new ShortUniqueId().rnd(15),
                title: title,
                content: content,
                codeblock: codeblock
            });
        return res.status(200)
            .render("success", {
                data: {
                    id: data.id,
                    title: data.title,
                    content: data.content,
                    codeblock: data.codeblock
                }
            });
    } catch (error: any) {
        if (result.array().length > 0) {
            return res.status(400).json({ errors: result.array() });
        }
        return res.status(500).json({ error: error.message });
    }
}

export default {
    renderHomepage,
    renderPasteById,
    renderAllPastes,
    renderPasteFormPage,
    parseCreatePasteFormInput
}