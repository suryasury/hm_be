-- AlterTable
ALTER TABLE `medicationStocks` MODIFY `dosageForm` ENUM('Tablet', 'Capsule', 'Powder', 'Ointment', 'Cream', 'Gel', 'Syrup', 'Pastes', 'Granules', 'Pellets', 'Lozenges', 'Elixirs', 'Tinctures', 'Liniments', 'Others') NOT NULL;
