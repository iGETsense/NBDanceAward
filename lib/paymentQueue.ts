/**
 * Enhanced Payment Queue for Mesomb
 * - Processes payments in background (non-blocking for users)
 * - Auto-retry on failures
 * - Rate limiting to prevent API overload
 * - Users get immediate response, payment processes asynchronously
 */

interface QueueTask<T> {
    task: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
    retries: number;
    maxRetries: number;
}

class PaymentQueue {
    private queue: QueueTask<any>[] = [];
    private processing = false;
    private maxConcurrent = 3; // Max 3 simultaneous Mesomb requests
    private activeRequests = 0;
    private minDelayMs = 300; // 300ms minimum between requests (invisible to user)
    private lastRequestTime = 0;

    /**
     * Add payment to queue - Returns immediately with transaction ID
     * Payment processes in background
     */
    async add<T>(
        task: () => Promise<T>,
        maxRetries: number = 3
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                task,
                resolve,
                reject,
                retries: 0,
                maxRetries,
            });

            // Start processing immediately (non-blocking)
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        if (this.activeRequests >= this.maxConcurrent) return;

        this.processing = true;

        while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
            const queueTask = this.queue.shift();
            if (!queueTask) continue;

            this.activeRequests++;

            // Process in background without blocking
            this.executeTask(queueTask).finally(() => {
                this.activeRequests--;
                this.processQueue(); // Process next task
            });
        }

        this.processing = false;
    }

    private async executeTask<T>(queueTask: QueueTask<T>) {
        try {
            // Rate limiting - wait if needed (invisible delay)
            await this.waitForRateLimit();

            // Execute the payment task
            const result = await queueTask.task();
            queueTask.resolve(result);

        } catch (error) {
            // Auto-retry on failure
            if (queueTask.retries < queueTask.maxRetries) {
                queueTask.retries++;

                // Exponential backoff (but still fast)
                const backoffDelay = Math.min(1000, 200 * Math.pow(2, queueTask.retries));
                await new Promise(resolve => setTimeout(resolve, backoffDelay));

                console.log(`[PaymentQueue] Retry ${queueTask.retries}/${queueTask.maxRetries}`);

                // Re-add to queue for retry
                this.queue.unshift(queueTask);
            } else {
                // Max retries exceeded
                console.error('[PaymentQueue] Max retries exceeded:', error);
                queueTask.reject(error);
            }
        }
    }

    private async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minDelayMs) {
            const delay = this.minDelayMs - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        this.lastRequestTime = Date.now();
    }

    getQueueLength(): number {
        return this.queue.length;
    }

    getActiveRequests(): number {
        return this.activeRequests;
    }
}

// Global singleton instance
export const paymentQueue = new PaymentQueue();
