export interface Participante {
    name: string;
    gender?: "m"|"f";
    abbreviated?: string;
}

function commonStartingChars(str1: string, str2: string) {
    for (let i = 0; i < str1.length; i++) {
        if (i === str2.length || str1[i] !== str2[i]) {
            return i;
        }
    }
    return str1.length;
}

export function abbreviateList(participants: Participante[]): Participante[] {
    let longest = 1;
    for (let i = 0; i < participants.length; i++) {
        const current = participants[i].name;
        for (let j = i+1; j < participants.length; j++) {
            const other = participants[j].name;
            const chars = commonStartingChars(current, other);
            if (chars > longest) {
                longest = chars;
            }
        }
    }
    return participants.map(p => ({...p, abbreviated: p.name.substr(0, longest+1).toLocaleUpperCase()}));
}
