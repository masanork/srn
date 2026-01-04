import { describe, test, expect } from 'bun:test';
import { parseMarkdown } from '@srn/core';

describe('Auto 2-column grid for consecutive single-line fields', () => {
    test('should wrap 2 consecutive single-line fields in form-grid-2col', () => {
        const markdown = `
# Test Form

## Basic Info

- [text:name] Name
- [text:email] Email
`;
        const { html } = parseMarkdown(markdown);

        // Should contain form-grid-2col wrapper
        expect(html).toContain('<div class="form-grid-2col">');

        // Should contain both fields
        expect(html).toContain('data-json-path="name"');
        expect(html).toContain('data-json-path="email"');
    });

    test('should wrap 3+ consecutive single-line fields in form-grid-2col', () => {
        const markdown = `
# Test Form

- [text:name] Name
- [number:age] Age
- [date:birthday] Birthday
`;
        const { html } = parseMarkdown(markdown);

        // Should contain form-grid-2col wrapper
        expect(html).toContain('<div class="form-grid-2col">');

        // Should contain all three fields
        expect(html).toContain('data-json-path="name"');
        expect(html).toContain('data-json-path="age"');
        expect(html).toContain('data-json-path="birthday"');

        // Should only have one grid wrapper (class appears once in opening tag)
        const gridCount = (html.match(/form-grid-2col/g) || []).length;
        expect(gridCount).toBe(1); // One opening tag with the class
    });

    test('should NOT wrap a single field in form-grid-2col', () => {
        const markdown = `
# Test Form

- [text:name] Name
`;
        const { html } = parseMarkdown(markdown);

        // Should NOT contain form-grid-2col wrapper
        expect(html).not.toContain('form-grid-2col');

        // Should contain the field
        expect(html).toContain('data-json-path="name"');
    });

    test('should NOT wrap textarea in form-grid-2col', () => {
        const markdown = `
# Test Form

- [text:name] Name
- [textarea:description] Description
`;
        const { html } = parseMarkdown(markdown);

        // Should NOT contain form-grid-2col wrapper (single field before textarea)
        expect(html).not.toContain('form-grid-2col');
    });

    test('should create separate grids when interrupted by textarea', () => {
        const markdown = `
# Test Form

- [text:firstName] First Name
- [text:lastName] Last Name
- [textarea:description] Description
- [text:email] Email
- [text:phone] Phone
`;
        const { html } = parseMarkdown(markdown);

        // Should contain form-grid-2col wrapper (for firstName and lastName)
        expect(html).toContain('<div class="form-grid-2col">');

        // Should have two separate grid sections
        const gridCount = (html.match(/<div class="form-grid-2col">/g) || []).length;
        expect(gridCount).toBe(2); // First for firstName+lastName, second for email+phone
    });

    test('should flush buffer before header', () => {
        const markdown = `
# Test Form

- [text:name] Name
- [text:email] Email

## Another Section

- [text:phone] Phone
`;
        const { html } = parseMarkdown(markdown);

        // Should have grid for first two fields
        expect(html).toContain('<div class="form-grid-2col">');

        // Phone should be standalone (single field)
        expect(html).toContain('data-json-path="phone"');
    });

    test('should flush buffer before table', () => {
        const markdown = `
# Test Form

- [text:name] Name
- [text:email] Email

| Item | Value |
| --- | --- |
| Test | 123 |
`;
        const { html } = parseMarkdown(markdown);

        // Should have grid for the two fields
        expect(html).toContain('<div class="form-grid-2col">');

        // Should have table
        expect(html).toContain('<table');
    });

    test('should handle mixed field types correctly', () => {
        const markdown = `
# Test Form

- [text:name] Name
- [number:age] Age
- [date:birthday] Birthday
- [search:city] City
`;
        const { html } = parseMarkdown(markdown);

        // All should be wrapped in grid
        expect(html).toContain('<div class="form-grid-2col">');

        // All fields should be present
        expect(html).toContain('data-json-path="name"');
        expect(html).toContain('data-json-path="age"');
        expect(html).toContain('data-json-path="birthday"');
        expect(html).toContain('data-json-path="city"');
    });
});
