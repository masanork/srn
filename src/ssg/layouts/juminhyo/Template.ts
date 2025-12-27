
import { normalizeText, normalizeDomicile, normalizeRemarks, getRowHeights } from './Logic.ts';

const rowHeights = getRowHeights();
const rowHeight = (rowNumber: number) => rowHeights[rowNumber - 1] ?? 18;

export const labelHtml = (main: string) => `
    <div class="label-text">
        <span class="label-main">${main}</span>
    </div>
`;

const fieldAttr = (path: string) => ` data-weba-field="${path}"`;

export function renderPersonRows(item: any, index: number, startRow: number) {
    const { honseki, hittosha } = normalizeDomicile(item.domiciles);
    const [remark1, remark2, remark3, remark4] = normalizeRemarks(item.remarks);

    return `
        <tr style="height: ${rowHeight(startRow)}px;">
            <td class="cell number-cell" rowspan="12">${index + 1}</td>
            <td class="cell label-cell" colspan="5">${labelHtml('氏名の振り仮名')}</td>
            <td class="cell value-cell" colspan="18"${fieldAttr(`credentialSubject.member[${index}].kana`)}>${normalizeText(item.kana)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('個人番号')}</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].individualNumber`)}>${normalizeText(item.individualNumber)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 1)}px;">
            <td class="cell label-cell" colspan="5" rowspan="2">${labelHtml('氏名')}</td>
            <td class="cell value-cell name-cell" colspan="18" rowspan="2"${fieldAttr(`credentialSubject.member[${index}].name`)}>${normalizeText(item.name)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('住民票コード')}</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].residentCode`)}>${normalizeText(item.residentCode)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 2)}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住民となった年月日')}</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].becameResidentDate`)}>${normalizeText(item.becameResidentDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 3)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('旧氏の振り仮名')}</td>
            <td class="cell value-cell" colspan="18"${fieldAttr(`credentialSubject.member[${index}].maidenKana`)}>${normalizeText(item.maidenKana)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('住所を定めた年月日')}</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].addressSetDate`)}>${normalizeText(item.addressSetDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 4)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('旧氏')}</td>
            <td class="cell value-cell" colspan="18"${fieldAttr(`credentialSubject.member[${index}].maidenName`)}>${normalizeText(item.maidenName)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('届出日')}</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].notificationDate`)}>${normalizeText(item.notificationDate)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 5)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('生年月日')}</td>
            <td class="cell value-cell" colspan="8"${fieldAttr(`credentialSubject.member[${index}].birthDate`)}>${normalizeText(item.birthDate)}</td>
            <td class="cell label-cell" colspan="2">${labelHtml('性別')}</td>
            <td class="cell value-cell" colspan="2"${fieldAttr(`credentialSubject.member[${index}].gender`)}>${normalizeText(item.gender)}</td>
            <td class="cell label-cell" colspan="2">${labelHtml('続柄')}</td>
            <td class="cell value-cell" colspan="4"${fieldAttr(`credentialSubject.member[${index}].relationship`)}>${normalizeText(item.relationship)}</td>
            <td class="cell label-cell" colspan="6">${labelHtml('筆頭者')}</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].domiciles[1]`)}>${normalizeText(hittosha)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 6)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('本籍')}</td>
            <td class="cell value-cell" colspan="34"${fieldAttr(`credentialSubject.member[${index}].domiciles[0]`)}>${normalizeText(honseki)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 7)}px;">
            <td class="cell label-cell" colspan="5">${labelHtml('転入前住所')}</td>
            <td class="cell value-cell" colspan="34"${fieldAttr(`credentialSubject.member[${index}].prevAddress`)}>${normalizeText(item.prevAddress)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 8)}px;">
            <td class="cell label-cell" colspan="5">＊＊＊</td>
            <td class="cell value-cell" colspan="18"${fieldAttr(`credentialSubject.member[${index}].remarks[0]`)}>${normalizeText(remark1)}</td>
            <td class="cell label-cell" colspan="6">＊＊＊</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].remarks[1]`)}>${normalizeText(remark2)}</td>
        </tr>
        <tr style="height: ${rowHeight(startRow + 9)}px;">
            <td class="cell label-cell" colspan="5">＊＊＊</td>
            <td class="cell value-cell" colspan="18"${fieldAttr(`credentialSubject.member[${index}].remarks[2]`)}>${normalizeText(remark3)}</td>
            <td class="cell label-cell" colspan="6">＊＊＊</td>
            <td class="cell value-cell" colspan="10"${fieldAttr(`credentialSubject.member[${index}].remarks[3]`)}>${normalizeText(remark4)}</td>
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
            <td class="cell no-border" colspan="14"></td>
            <td class="cell title-cell no-border" colspan="12" rowspan="2"${fieldAttr('credentialSubject.name')}>${normalizeText(certificateTitle)}</td>
            <td class="cell no-border" colspan="14"></td>
        </tr>
        <tr style="height: ${rowHeights[1]}px;">
            <td class="cell no-border" colspan="14"></td>
            <td class="cell no-border" colspan="14"></td>
        </tr>
        <tr style="height: ${rowHeights[2]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('住所')}</td>
            <td class="cell value-cell" colspan="34"${fieldAttr('credentialSubject.address')}>${normalizeText(address)}</td>
        </tr>
        <tr style="height: ${rowHeights[3]}px;">
            <td class="cell label-cell" colspan="6">${labelHtml('世帯主')}</td>
            <td class="cell value-cell" colspan="34"${fieldAttr('credentialSubject.householder')}>${normalizeText(householder)}</td>
        </tr>
        <tr style="height: ${rowHeights[4]}px;">
            <td class="cell no-border" colspan="40"></td>
        </tr>
    `;
}
