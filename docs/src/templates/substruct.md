{{#if kind}}
{{#ifCond kind '===' 'object'}}{{#if name}}{{name}}: {{/if}}{ {{#if optional}} // Optional{{/if}}
{{#if description}}
  // {{{description}}}
{{/if}}
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
{{name}}: {{#sample this}}{{/sample}}, {{#if optional}} // Optional{{/if}}
{{/ifCond}}
{{/ifCond}}
{{else}}
{{name}}: {{#sample this}}{{/sample}},{{#if description}} // {{{description}}}{{/if}}{{#if optional}} // Optional{{/if}}
{{/if}}
