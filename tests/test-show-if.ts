
import { parseMarkdown } from '../src/form/parser';
import { Renderers } from '../src/form/renderer';
import { expect, test } from "bun:test";

const markdown = `
- [radio:has_pet (value="yes")] Yes
- [radio:has_pet (value="no")] No
- [text:pet_name (show_if="has_pet == 'yes'")] Pet Name
- [number:age (min="18")] Age
`;

console.log("--- Testing show_if and validation attributes ---");

const { html, jsonStructure } = parseMarkdown(markdown);

console.log("JSON Fields:", JSON.stringify(jsonStructure.fields, null, 2));
console.log("HTML Snippet:", html);

// Assertions
if (html.includes('data-show-if="has_pet == &#039;yes&#039;"') || html.includes('data-show-if="has_pet == \'yes\'"')) {
    console.log("✅ data-show-if attribute present");
} else {
    console.error("❌ data-show-if attribute MISSING");
    process.exit(1);
}

if (html.includes('min="18"')) {
    console.log("✅ min validation attribute present");
} else {
    console.error("❌ min validation attribute MISSING");
    process.exit(1);
}

const petField = jsonStructure.fields.find((f: any) => f.key === 'pet_name');
if (petField && petField.show_if === "has_pet == 'yes'") {
    console.log("✅ JSON show_if metadata correct");
} else {
    console.error("❌ JSON show_if metadata INCORRECT", petField);
    process.exit(1);
}

console.log("--- Test Passed ---");
