{{anchor parent name}}{{#if parent}}_{{ parent }}_.{{/if}}**{{ name }}**{{>params params}}{{#typedef returns}} _:{{this}}_{{/typedef}}

{{#ifCond params.length '||' returns }}
|Name(s)|Type(s)|Description|Optional|Default value|
|-------|-------|-----------|--------|-------------|
{{#each params}}
| {{ name }} | {{#typedef this}} _{{this}}_ {{/typedef}} | {{no description}} | {{>bool optional}} | {{no defaultValue}} |
{{/each}}
{{#if returns}}
| Returns | {{#typedef returns}} _{{this}}_ {{/typedef}} | {{no returns.description}} | ... | ... |
{{/if}}
{{/ifCond}}

{{nocust description 'No description'}}

{{>examples examples}}
