export function normalizeText(value?: string) {
    return value ?? '';
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