import { HomeSliderService } from "./home-slider.service";

describe("HomeSliderService", () => {
    it("returns default copy when settings do not exist yet", async () => {
        const findFirst = jest.fn().mockResolvedValue(null);
        const service = new HomeSliderService({ homeSlider: { findFirst } } as never);

        const slider = await service.getPublicSlider();

        expect(slider.title).toBe("Техника для работы, учебы и дома без лишнего шума");
        expect(slider.imageUrl).toBeNull();
        expect(slider.primaryText).toBeNull();
        expect(findFirst).toHaveBeenCalledWith({ orderBy: { updatedAt: "desc" } });
    });

    it("upserts editable slider copy into a single settings row", async () => {
        const findFirst = jest.fn().mockResolvedValue({ id: "slider_1" });
        const update = jest.fn().mockResolvedValue({ id: "slider_1", title: "Новый слайдер" });
        const service = new HomeSliderService({ homeSlider: { findFirst, update } } as never);

        await service.update({
            kicker: "Витрина",
            title: "Новый слайдер",
            description: "Текст на главной",
            primaryText: "7",
            primaryLabel: "разделов",
            secondaryText: "3 300 Br",
            secondaryLabel: "выгодное предложение",
            panelKicker: "Price watch",
            panelTitle: "Apple iPhone",
            panelDescription: "В наличии",
            imageUrl: "/uploads/general/banner.png",
            isActive: true,
        });

        expect(update).toHaveBeenCalledWith({
            where: { id: "slider_1" },
            data: {
                kicker: "Витрина",
                title: "Новый слайдер",
                description: "Текст на главной",
                primaryText: "7",
                primaryLabel: "разделов",
                secondaryText: "3 300 Br",
                secondaryLabel: "выгодное предложение",
                panelKicker: "Price watch",
                panelTitle: "Apple iPhone",
                panelDescription: "В наличии",
                imageUrl: "/uploads/general/banner.png",
                isActive: true,
            },
        });
    });
});
