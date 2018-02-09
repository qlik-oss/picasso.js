{{anchor parent name}}{{#if parent}}*{{ parent }}*.{{/if}}**{{ name }}**{{>params params}}{{#typedef returns}} *:{{this}}*{{/typedef}}

{{#ifCond params.length '||' returns }}
|Name(s)|Type(s)|Description|Optional|Default value|
|-------|-------|-----------|--------|-------------|
{{#each params}}
| {{ name }} | {{#typedef this}} *{{this}}* {{/typedef}} | {{no description}} | {{>bool optional}} | {{no defaultValue}} |
{{/each}}
{{#if returns}}
| Returns | {{#typedef returns}} *{{this}}* {{/typedef}} | {{no returns.description}} | ... | ... |
{{/if}}
{{/ifCond}}

{{nocust description 'No description'}}

{{>examples examples}}
