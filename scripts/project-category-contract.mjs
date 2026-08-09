const CATEGORY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isDisplayableProject = (project) =>
    project && typeof project.title === 'string' && project.title.trim().length > 0;

export const validateProjectCategoryCatalogs = ({ locales, catalogs, projectsByLocale }) => {
    const errors = [];
    const idsByLocale = new Map();

    for (const locale of locales) {
        const categories = catalogs[locale];
        const projects = projectsByLocale[locale];

        if (!Array.isArray(categories)) {
            errors.push(`${locale}: project category catalog must be an array`);
            continue;
        }

        const ids = [];
        const seen = new Set();

        categories.forEach((category, index) => {
            if (!category || typeof category !== 'object' || Array.isArray(category)) {
                errors.push(`${locale}: category at index ${index} must be an object`);
                return;
            }

            const id = typeof category.id === 'string' ? category.id.trim() : '';
            const label = typeof category.label === 'string' ? category.label.trim() : '';

            if (!id) errors.push(`${locale}: category at index ${index} has an empty id`);
            else if (id !== '*' && !CATEGORY_ID_PATTERN.test(id)) {
                errors.push(`${locale}: category id ${JSON.stringify(id)} must use kebab-case`);
            }

            if (!label) errors.push(`${locale}: category ${JSON.stringify(id || index)} has an empty label`);
            if (seen.has(id)) errors.push(`${locale}: duplicate project category id ${JSON.stringify(id)}`);
            if (id) {
                ids.push(id);
                seen.add(id);
            }
        });

        if (ids[0] !== '*') errors.push(`${locale}: the reserved "*" category must be first`);
        if (ids.filter((id) => id === '*').length !== 1) {
            errors.push(`${locale}: the reserved "*" category must appear exactly once`);
        }

        if (!Array.isArray(projects)) {
            errors.push(`${locale}: project dataset must be an array`);
        } else {
            projects.filter(isDisplayableProject).forEach((project) => {
                const category = typeof project.category === 'string' ? project.category.trim() : '';
                if (!category) errors.push(`${locale}: project ${JSON.stringify(project.title)} has no category`);
                else if (category === '*') {
                    errors.push(`${locale}: project ${JSON.stringify(project.title)} cannot use the reserved "*" category`);
                }
                else if (!seen.has(category)) {
                    errors.push(
                        `${locale}: project ${JSON.stringify(project.title)} uses undefined category ${JSON.stringify(category)}`,
                    );
                }
            });
        }

        idsByLocale.set(locale, ids);
    }

    const referenceLocale = locales[0];
    const referenceIds = idsByLocale.get(referenceLocale);
    if (referenceIds) {
        for (const locale of locales.slice(1)) {
            const ids = idsByLocale.get(locale);
            if (ids && JSON.stringify(ids) !== JSON.stringify(referenceIds)) {
                errors.push(`${locale}: project category ids and order must match ${referenceLocale}`);
            }
        }
    }

    return errors;
};
