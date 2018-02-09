## {{ name }}

### Methods

{{#each entries}}
  {{~#ifCond kind '===' 'function'~}}
{{>(lookup . 'kind') this name=@key parent=../parent}}
  {{~/ifCond~}}
{{/each}}

{{#if events}}
### Events

{{#each events}}
  {{~>(lookup . 'kind') this name=@key parent=../parent}}
{{/each}}

{{/if}}
