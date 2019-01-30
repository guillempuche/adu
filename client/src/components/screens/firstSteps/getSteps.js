export const getStepsTitle = [
    "Información sobre la universidad",
    "(Opcional) E-mail para las notificaciones",
    "Añadir chat a tu web"
];

export const getOrganizationFormInfo = {
    ids: {
        university: ["universityName", "universityAcronym"],
        faculty: ["facultyName", "facultyAcronym"]
    },
    labels: {
        university: ["Nombre de la universidad", "Acrónimo de la universidad"],
        faculty: ["Nombre de la facultad", "Acrónimo de la facultad"]
    },
    instructions: {
        universityInstructions:
            "Necesitamos el nombre de tu universidad para mostrarlo a los estudiantes en el chat.",
        facultyInstructions:
            "Si quieres implementar el chat solo para alguna facultad, escribe el nombre de cada una de ellas"
    },
    sample: {
        university: "ej: Universitat de Barcelona",
        universityAcronym: "ej: UB",
        faculty: "ej: Facultat/Centre de Filosofia",
        facultyAcronym: "ej: FF"
    }
};

export const getEmailInfo = {
    id: "newEmail",
    label: "(opcional) E-mail nuevo",
    instructions:
        "Puedes cambiar tu e-mail actual (extraído de Google) para redirigir las comunicaciones con nuestro servicio (ej: avisos de nuevos mensajes de chat, consejos...) a otro e-mail predeterminado.",
    sample: "ej: email@email.com",
    helper: "E-mail actual predeterminado"
};
