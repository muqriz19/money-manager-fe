import { createIcons, icons as lucideIcons } from 'lucide';

export function createLucideIcons(miliseconds: number) {
	setTimeout(() => {
		createIcons({ icons: lucideIcons });
	}, miliseconds);
}

export interface ClearLucideOptions {
	ignoreClass: string[];
}

export function clearAnyLucideIcons(options: ClearLucideOptions, parentElement?: HTMLElement) {
	return new Promise<void>((resolve) => {
		let ignoreClasses = [''];

		if (options) {
			ignoreClasses = options.ignoreClass ?? [''];
		}

		const query = `[class*="lucide"]`;
		const lucideReferences = document.querySelectorAll(query);

		if (parentElement) {
			parentElement.querySelectorAll(query)?.forEach((reference) => {
				reference.remove();
			});
		}

		if (ignoreClasses?.length > 0) {
			lucideReferences.forEach((reference) => {
				for (let ignoreClassString of ignoreClasses) {
					if (!reference.getAttribute('class')?.includes(ignoreClassString)) {
						reference.remove();
					}
				}
			});
		} else {
			lucideReferences.forEach((reference) => {
				reference.remove();
			});
		}

		resolve();
	});
}
