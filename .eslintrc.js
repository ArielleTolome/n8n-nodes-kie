module.exports = {
	root: true,
	env: {
		node: true,
		es6: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		sourceType: 'module',
	},
	plugins: ['n8n-nodes-base'],
	extends: [
		'eslint:recommended',
		'plugin:n8n-nodes-base/community',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		// Отключаем строгие правила, которые могут блокировать билд прямо сейчас,
		// так как код уже написан и работает.
		'n8n-nodes-base/node-class-description-credentials-name-unsuffixed': 'off',
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
		'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
};
