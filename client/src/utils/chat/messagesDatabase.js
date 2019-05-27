export default [
    {
        id: 'welcome',
        data: [
            {
                lang: 'ca',
                type: {
                    text: `Hola 😃! Sóc l'Au.

                        Estic aquí per resoldre't els dubtes sobre la matrícula i els graus.`
                }
            },
            {
                lang: 'ca',
                type: {
                    text:
                        'Fes clic 👇 al tema que encara no saps per anar ben preparat a la matrícula! 💯'
                }
            },
            {
                lang: 'ca',
                type: {
                    quickReplies: [
                        {
                            goToBlocks: ['calendar'],
                            text: 'Calendari 📆'
                        },
                        {
                            goToBlocks: ['price'],
                            text: 'Preus 💶'
                        },
                        // {
                        //     goToBlocks: ['step2', 'step3'],
                        //     text: 'Go to 2 & 3'
                        // },
                        {
                            goToBlocks: ['person'],
                            text: 'Parlar amb Secretaria 👧'
                        }
                    ]
                }
            }
        ]
    },
    {
        id: 'hi',
        data: [
            {
                lang: 'ca',
                type: { text: `Ei! Hola una altra vegada! 💛` }
            },
            // {
            //     lang: 'ca',
            //     type: {
            //         attachment: {
            //             type: 'image',
            //             payload: {
            //                 fileName: 'prova de matricula',
            //                 url:
            //                     'https://res.cloudinary.com/guillemau/image/upload/v1555577046/dev/individual/multiple-different-students.jpg'
            //             }
            //         }
            //     }
            // },
            {
                lang: 'ca',
                type: {
                    attachment: {
                        type: 'file',
                        payload: {
                            fileName: 'prova de matricula',
                            url:
                                'https://res.cloudinary.com/guillemau/image/upload/v1555577190/dev/individual/prova_pdf.pdf'
                        }
                    }
                }
            },
            {
                lang: 'ca',
                type: {
                    quickReplies: [
                        {
                            goToBlocks: ['welcome'],
                            text: 'Inici'
                        },
                        { goToBlocks: ['calendar'], text: 'Calendari 📆' },
                        { goToBlocks: ['person'], text: 'Persona 👧' },
                        { goToBlocks: ['price'], text: 'Preus 💶' },
                        { goToBlocks: ['price'], text: 'Preus 💶' },
                        { goToBlocks: ['price'], text: 'Preus 💶' },
                        { goToBlocks: ['price'], text: 'Preus 💶' }
                    ]
                }
            }
        ]
    },
    {
        id: 'calendar',
        data: [
            {
                lang: 'ca',
                type: { text: `Les classes comencen el 17 de setembre.` }
            },
            {
                lang: 'ca',
                type: {
                    text: `Aquí tens l'horari de classes del 1r quadrimestre: https://bit.ly/2WHCqdh`
                }
            },
            {
                lang: 'ca',
                type: {
                    quickReplies: [
                        { goToBlocks: ['welcome'], text: 'Inici' }, //'Notes de tall 📊' },
                        { goToBlocks: ['price'], text: 'Preus 💶' }
                    ]
                }
            }
        ]
    },
    {
        id: 'price',
        data: [
            {
                lang: 'ca',
                type: { text: 'Els preus del graus són de 2.000€.' }
            },
            {
                lang: 'ca',
                type: {
                    quickReplies: [
                        {
                            goToBlocks: ['welcome'],
                            text: 'Inici'
                        }, //'Preinscripcions de matrícula'
                        { goToBlocks: ['calendar'], text: 'Calendari 📆' } // 'Assignatures 📚' }
                    ]
                }
            }
        ]
    }
];
