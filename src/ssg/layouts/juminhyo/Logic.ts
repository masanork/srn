export function normalizeText(value?: string) {
    return value ?? '';
}

export function formatDateWareki(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return as is if invalid date

    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const format = (era: string, year: number) => {
        const yStr = year === 1 ? '元' : year.toString();
        return `${era}${yStr}年${m}月${d}日`;
    };

    if (y > 2019 || (y === 2019 && m >= 5)) return format('令和', y - 2018);
    if (y > 1989 || (y === 1989 && m >= 1 && d >= 8)) return format('平成', y - 1988);
    if (y > 1926 || (y === 1926 && m >= 12 && d >= 25)) return format('昭和', y - 1925);
    if (y > 1912 || (y === 1912 && m >= 7 && d >= 30)) return format('大正', y - 1911);
    if (y >= 1868) return format('明治', y - 1867);

    return `${y}年${m}月${d}日`; // Fallback to seireki with kanji suffix
}

export function normalizeDomicile(domiciles?: string[]) {
    if (!domiciles || domiciles.length === 0) {
        return { honseki: '', hittosha: '' };
    }
    const honseki = domiciles[0] ?? '';
    const hittosha = domiciles[1] ? domiciles[1].replace(/^筆頭者：?/, '') : '';
    return { honseki, hittosha };
}

export function normalizeRemarks(remarks?: string[]) {
    return Array.from({ length: 4 }, (_, idx) => remarks?.[idx] ?? '');
}

export function getRowHeights() {
    return Array.from({ length: 53 }, (_, idx) => (idx === 5 ? 17 : 18));
}

export function prepareSubject(data: any, vc?: any) {
    if (vc?.credentialSubject) return vc.credentialSubject;

    // Normalization Layer: Map Japanese aliases to English internal keys
    const items = (data.世帯員 || data.items || []).map((p: any) => ({
        name: p.氏名 || p.name,
        kana: p.フリガナ || p.kana,
        birthDate: p.生年月日 || p.dob || p.birthDate,
        gender: p.性別 || p.gender,
        relationship: p.続柄 || p.relationship,
        becameResidentDate: p.住民となった日 || p.becameResident,
        becameResidentReason: p.住民となった事由 || p.becameResidentReason,
        addressSetDate: p.住所を定めた日 || p.addressDate || p.addressSetDate,
        notificationDate: p.届出日 || p.notificationDate,
        residentCode: p.住民票コード || p.residentCode,
        individualNumber: p.個人番号 || p.myNumber || p.individualNumber,
        prevAddress: p.前住所 || p.prevAddress,
        domiciles: p.本籍 || p.domiciles,
        remarks: p.備考 || p.remarks,
        maidenName: p.旧氏 || p.maidenName,
        maidenKana: p.旧氏カナ || p.maidenKana
    }));

    return {
        name: data.証明書名称 || data.certificateTitle || data.title,
        householder: data.世帯主氏名 || data.householder,
        address: data.世帯住所 || data.address,
        issueDate: data.交付年月日 || data.issueDate || data.date,
        issuer: {
            title: data.発行者役職 || data.issuer?.title,
            name: data.発行者氏名 || data.issuer?.name
        },
        member: items
    };
}