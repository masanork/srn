
import { normalizeText, normalizeDomicile, normalizeRemarks, getRowHeights } from './Logic.ts';

const rowHeights = getRowHeights();
const rowHeight = (rowNumber: number) => rowHeights[rowNumber - 1] ?? 18;

export const labelHtml = (main: string) => `
    <div class="label-text">
        <span class="label-main">${main}</span>
    </div>
`;

export function renderPersonRows(item: any, index: number, startRow: number) {
    const { honseki, hittosha } = normalizeDomicile(item.domiciles);
    const [remark1, remark2, remark3, remark4] = normalizeRemarks(item.remarks);

    return `
        <tr style="height: ${rowHeight(startRow)}px;">
            <td class="cell number-cell" rowspan="12">${index + 1}</td>
            <td class="cell label-cell" colspan="5">${labelHtml('氏名の振り仮名')}</td>
            <td class="cell value-cell" colspan="18">${normalizeText(item.kana)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('個人番号')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.individualNumber)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 1)}px;">
            <td class="cell label-cell" colspan="5" rowspan="2">${labelHtml('氏名')}</td>
            <td class="cell value-cell name-cell" colspan="18" rowspan="2">${normalizeText(item.name)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('住民票コード')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.residentCode)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 2)}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住民となった年月日')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.becameResidentDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 3)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('旧氏の振り仮名')}</td>
            <td class="cell value-cell" colspan="18">${normalizeText(item.maidenKana)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('住所を定めた年月日')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.addressSetDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 4)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('旧氏')}</td>
            <td class="cell value-cell" colspan="18">${normalizeText(item.maidenName)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('届出日')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(item.notificationDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 5)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('生年月日')}</td>
            <td class="cell value-cell" colspan="8">${normalizeText(item.birthDate)}</td>
            <td class="cell label-cell" colspan="2">${labelHtml('性別')}</td>
            <td class="cell value-cell" colspan="2">${normalizeText(item.gender)}</td>
            <td class="cell label-cell" colspan="2">${labelHtml('続柄')}</td>
            <td class="cell value-cell" colspan="4">${normalizeText(item.relationship)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('筆頭者')}</td>
            <td class="cell value-cell" colspan="10">${normalizeText(hittosha)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 6)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('本籍')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(honseki)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 7)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('転入前住所')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(item.prevAddress)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 8)}px;">
            <td class="cell label-cell" colspan="5">＊＊＊</td>
            <td class="cell value-cell" colspan="18">${normalizeText(remark1)}</td>
            <td class="cell label-cell" colspan="6">＊＊＊</td>
            <td class="cell value-cell" colspan="10">${normalizeText(remark2)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 9)}px;">
            <td class="cell label-cell" colspan="5">＊＊＊</td>
            <td class="cell value-cell" colspan="18">${normalizeText(remark3)}</td>
            <td class="cell label-cell" colspan="6">＊＊＊</td>
            <td class="cell value-cell" colspan="10">${normalizeText(remark4)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 10)}px;">
            <td class="cell value-cell" colspan="39"></td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 11)}px;">
            <td class="cell value-cell" colspan="39"></td>
        </tr>
    `;
}

export function tableHeaderRows(certificateTitle: string, address: string, householder: string) {
    return `
        <tr style="height: ${rowHeights[0]}px;">
            <td class="cell no-border" colspan="16"></td>
            <td class="cell title-cell no-border" colspan="7" rowspan="2">${normalizeText(certificateTitle)}</td>
            <td class="cell no-border" colspan="17"></td>
        </tr>
        <tr style="height: ${rowHeights[1]}px;">
            <td class="cell no-border" colspan="16"></td>
            <td class="cell no-border" colspan="17"></td>
        </tr>
        <tr style="height: ${rowHeights[2]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住所')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(address)}</td>
        </tr>
        <tr style="height: ${rowHeights[3]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('世帯主')}</td>
            <td class="cell value-cell" colspan="34">${normalizeText(householder)}</td>
        </tr>
        <tr style="height: ${rowHeights[4]}px;">
            <td class="cell no-border" colspan="40"></td>
        </tr>
    `;
}
