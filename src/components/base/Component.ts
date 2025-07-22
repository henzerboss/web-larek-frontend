/**
 * Абстрактный базовый класс для компонентов представления.
 */
export abstract class Component<T> {
	public readonly container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	// Устанавливает текстовое содержимое элемента
	protected setText(element: HTMLElement, value: unknown): void {
		if (element) {
			element.textContent = String(value);
		}
	}

	// Управляет состоянием disabled у элемента (обычно кнопки)
    protected setDisabled(element: HTMLElement, state: boolean): void {
        if (element) {
            (element as HTMLButtonElement).disabled = state;
        }
    }

	// Отрисовывает компонент, применяя данные и возвращая корневой элемент
	render(data?: Partial<T>): HTMLElement {
		Object.assign(this as object, data ?? {});
		return this.container;
	}
}