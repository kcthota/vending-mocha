import { format, parse } from 'date-fns';

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        return format(parse(dateString, 'yyyy-MM-dd', new Date()), 'MMMM dd, yyyy');
    } catch (e) {
        return dateString;
    }
};
