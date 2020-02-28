{{#if kind}}
{{#if description}}
/_ {{{description}}} _/
{{/if}}
{{#ifCond kind '===' 'object'}}{{#if name}}{{name}}: {{/if}}{ {{#if optional}} // Optional{{/if}}
{{#each entries}}
{{>substruct this name=@key}}
{{/each}}
},
{{else}}
{{#ifCond kind '===' 'array'}}
{{name}}: [ {{#if optional}} // Optional{{/if}}
{{>substruct this.items}}
],
{{else}}
{{name}}: {{#sample this}}{{/sample}},{{#if optional}} // Optional{{/if}}
{{/ifCond}}
{{/ifCond}}
{{else}}
{{#if description}}
/_ {{{description}}} _/
{{/if}}
{{name}}: {{#sample this}}{{/sample}},{{#if optional}} // Optional{{/if}}
{{/if}}
