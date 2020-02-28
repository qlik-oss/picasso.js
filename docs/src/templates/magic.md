{{#med (get ctx this) parent=parent}}
{{~#each entries~}}
{{~>(lookup . 'kind') this name=@key parent=../parent}}
{{~/each~}}
{{#if events}}
**Events**

{{#each events~}}
{{~>(lookup . 'kind') this name=@key parent=../parent}}
{{~/each}}
{{/if}}
{{else}}
Context {{ ctx }} is not available {{get ctx this}}
{{error 'Context unavailable ' ctx}}
{{/med}}
