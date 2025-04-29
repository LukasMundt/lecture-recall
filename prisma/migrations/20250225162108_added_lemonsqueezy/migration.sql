-- CreateTable
CREATE TABLE `Plans` (
    `id` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productName` TEXT NULL,
    `variantId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` VARCHAR(191) NOT NULL,
    `isUsageBased` BOOLEAN NOT NULL DEFAULT false,
    `interval` TEXT NULL,
    `intervalCount` INTEGER NULL,
    `trialInterval` TEXT NULL,
    `trialIntervalCount` INTEGER NULL,
    `sort` INTEGER NULL,

    UNIQUE INDEX `Plans_variantId_key`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
