import { Label } from './label-config'

export class LabelSyncer {
	async syncLabels(): Promise<void> {}

	private selectHighestPriorityLabels(labels: Label[]): Label {
		// todo implement this
		return labels[0]
	}
}
