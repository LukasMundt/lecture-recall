-- CreateTable
CREATE TABLE `WebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eventName` TEXT NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `body` JSON NOT NULL,
    `processingError` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `lemonSqueezyId` VARCHAR(191) NOT NULL,
    `orderId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `statusFormatted` VARCHAR(191) NOT NULL,
    `renewsAt` VARCHAR(191) NULL,
    `endsAt` VARCHAR(191) NULL,
    `trialEndsAt` VARCHAR(191) NULL,
    `price` VARCHAR(191) NOT NULL,
    `isUsageBased` BOOLEAN NOT NULL DEFAULT false,
    `isPaused` BOOLEAN NOT NULL DEFAULT false,
    `subscriptionItemId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `planId` INTEGER NOT NULL,

    UNIQUE INDEX `Subscription_lemonSqueezyId_key`(`lemonSqueezyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
