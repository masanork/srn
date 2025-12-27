
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
    return vc?.credentialSubject || {
        name: data.certificateTitle,
        householder: data.householder,
        address: data.address,
        member: (data.items || []).map((item: any) => ({
            name: item.name,
            kana: item.kana,
            birthDate: item.dob,
            gender: item.gender,
            relationship: item.relationship,
            becameResidentDate: item.becameResident,
            addressSetDate: item.addressDate,
            notificationDate: item.notificationDate,
            residentCode: item.residentCode,
            individualNumber: item.myNumber,
            prevAddress: item.prevAddress,
            domiciles: item.domiciles,
            remarks: item.remarks
        }))
    };
}
