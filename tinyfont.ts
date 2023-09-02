namespace tinyFont {
    const CODE_LOWERCASE_A = 'a'.charCodeAt(0)
    const CODE_LOWERCASE_Z = 'z'.charCodeAt(0)
    const CODE_UPPERCASE_A = 'A'.charCodeAt(0)
    const CODE_UPPERCASE_Z = 'Z'.charCodeAt(0)
    const CODE_0 = '0'.charCodeAt(0)
    const CODE_9 = '9'.charCodeAt(0)

    const CHAR_WIDTH = 4

    export function print(image: Image, text: string, x: number, y: number, color: number = 1) {
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i)
            let glyph: Image

            if (code >= CODE_LOWERCASE_A && code <= CODE_LOWERCASE_Z) {
                glyph = FONT3_ALPHA[code - CODE_LOWERCASE_A]
            } else if (code >= CODE_UPPERCASE_A && code <= CODE_UPPERCASE_Z) {
                glyph = FONT3_ALPHA[code - CODE_UPPERCASE_A]
            } else if (code >= CODE_0 && code <= CODE_9) {
                glyph = FONT3_DIGITS[code - CODE_0]
            } else {
                glyph = FONT3_SPECIALS[text.charAt(i)]
            }

            if (!!glyph) {
                glyph = glyph.clone()
                glyph.replace(1, color)
                image.drawTransparentImage(glyph, x + i * CHAR_WIDTH, y)
            }
        }
    }

    const FONT3_DIGITS = [
        img`
            1 1 1
            1 . 1
            1 . 1
            1 . 1
            1 1 1
            `,
        img`
            . . 1
            . . 1
            . . 1
            . . 1
            . . 1
            `,
        img`
            1 1 1
            . . 1
            1 1 1
            1 . .
            1 1 1
            `,
        img`
            1 1 1
            . . 1
            1 1 1
            . . 1
            1 1 1
            `,
        img`
            1 . 1
            1 . 1
            1 1 1
            . . 1
            . . 1
            `,
        img`
            1 1 1
            1 . .
            1 1 1
            . . 1
            1 1 1
            `,
        img`
            1 1 1
            1 . .
            1 1 1
            1 . 1
            1 1 1
            `,
        img`
            1 1 1
            . . 1
            . . 1
            . . 1
            . . 1
            `,
        img`
            1 1 1
            1 . 1
            1 1 1
            1 . 1
            1 1 1
            `,
        img`
            1 1 1
            1 . 1
            1 1 1
            . . 1
            . . 1
            `,
    ]

    const FONT3_ALPHA = [
        img`
            . 1 .
            1 . 1
            1 1 1
            1 . 1
            1 . 1
            `,
        img`
            1 1 .
            1 . 1
            1 1 .
            1 . 1
            1 1 .
            `,
        img`
            . 1 1
            1 . .
            1 . .
            1 . .
            . 1 1
            `,
        img`
            1 1 .
            1 . 1
            1 . 1
            1 . 1
            1 1 .
            `,
        img`
            1 1 1
            1 . .
            1 1 1
            1 . .
            1 1 1
            `,
        img`
            1 1 1
            1 . .
            1 1 1
            1 . .
            1 . .
            `,
        img`
            . 1 1
            1 . .
            1 . .
            1 . 1
            . 1 1
            `,
        img`
            1 . 1
            1 . 1
            1 1 1
            1 . 1
            1 . 1
            `,
        img`
            1 1 1
            . 1 .
            . 1 .
            . 1 .
            1 1 1
            `,
        img`
            . . 1
            . . 1
            . . 1
            . . 1
            1 1 .
            `,
        img`
            1 . 1
            1 . 1
            1 1 .
            1 . 1
            1 . 1
            `,
        img`
            1 . .
            1 . .
            1 . .
            1 . .
            1 1 1
            `,
        img`
            1 . 1
            1 1 1
            1 1 1
            1 . 1
            1 . 1
            `,
        img`
            1 1 .
            1 . 1
            1 . 1
            1 . 1
            1 . 1
            `,
        img`
            . 1 .
            1 . 1
            1 . 1
            1 . 1
            . 1 .
            `,
        img`
            1 1 .
            1 . 1
            1 1 .
            1 . .
            1 . .
            `,
        img`
            . 1 .
            1 . 1
            1 . 1
            1 1 .
            . 1 1
            `,
        img`
            1 1 .
            1 . 1
            1 1 .
            1 . 1
            1 . 1
            `,
        img`
            . 1 1
            1 . .
            . 1 .
            . . 1
            1 1 .
            `,
        img`
            1 1 1
            . 1 .
            . 1 .
            . 1 .
            . 1 .
            `,
        img`
            1 . 1
            1 . 1
            1 . 1
            1 . 1
            . 1 1
            `,
        img`
            1 . 1
            1 . 1
            1 . 1
            1 . 1
            . 1 .
            `,
        img`
            1 . 1
            1 . 1
            1 1 1
            1 1 1
            1 . 1
            `,
        img`
            1 . 1
            1 . 1
            . 1 .
            1 . 1
            1 . 1
            `,
        img`
            1 . 1
            1 . 1
            1 . 1
            . 1 .
            . 1 .
            `,
        img`
            1 1 1
            . . 1
            . 1 .
            1 . .
            1 1 1
            `,
    ]

    const FONT3_SPECIALS: { [char: string]: Image } = {
        '!': img`
            . 1 .
            . 1 .
            . 1 .
            . . .
            . 1 .
            `,
        '.': img`
            . . .
            . . .
            . . .
            . . .
            . 1 .
            `,
        ',': img`
            . . .
            . . .
            . . .
            . 1 .
            1 . .
            `,
        '?': img`
            1 1 .
            . . 1
            . 1 .
            . . .
            . 1 .
            `,
        '-': img`
            . . .
            . . .
            1 1 1
            . . .
            . . .
            `,
        '+': img`
            . . .
            . 1 .
            1 1 1
            . 1 .
            . . .
            `,
        '*': img`
            . . .
            1 . 1
            . 1 .
            1 . 1
            . . .
            `,
        '/': img`
            . . 1
            . . 1
            . 1 .
            1 . .
            1 . .
            `,
        '=': img`
            . . .
            1 1 1
            . . .
            1 1 1
            . . .
            `,
        "'": img`
            . 1 .
            . 1 .
            . . .
            . . .
            . . .
            `,
        '"': img`
            1 . 1
            1 . 1
            . . .
            . . .
            . . .
            `,
    }
}