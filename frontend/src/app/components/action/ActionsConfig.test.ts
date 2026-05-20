import { getActionItems } from './ActionsConfig';
import { SiteActionBtn } from '../../features/details/dto/SiteDetailsMode';

describe('getActionItems', () => {
  test('includes Download PDF when canDownloadPdf is true', () => {
    const items = getActionItems(false, false, true);
    expect(
      items.find((i) => i.value === SiteActionBtn.DOWNLOAD_PDF),
    ).toBeDefined();
  });

  test('excludes Download PDF when canDownloadPdf is false', () => {
    const items = getActionItems(false, false, false);
    expect(
      items.find((i) => i.value === SiteActionBtn.DOWNLOAD_PDF),
    ).toBeUndefined();
  });
});
